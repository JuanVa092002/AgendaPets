# Despliegue a producción — Backend y base de datos

> Repo: [AgendaPets/Backend_AgendaPets](https://github.com/AgendaPets/Backend_AgendaPets)  
> Fecha: **15 de septiembre de 2026**  
> Este archivo documenta **solo** la API (Render) y PostgreSQL (Neon). El frontend tiene su propio documento en el repo [AgendaPets/AgendaPets](https://github.com/AgendaPets/AgendaPets) (`despliegue-produccion.md`).

No reemplaza [documentacion.md](documentacion.md) (guía de la API). Aquí queda el puente a producción.

---

## 1. Resultado

| Pieza | Dónde | URL / dato |
|-------|--------|------------|
| **API REST** | Render, servicio `agendapets-api` | https://agendapets-api.onrender.com |
| **Dashboard Render** | `srv-dak51261egvs7394alg0` | https://dashboard.render.com/web/srv-dak51261egvs7394alg0 |
| **PostgreSQL** | Neon, proyecto AgendaPets (`still-flower-10770367`) | Host directo `ep-old-moon-aynusiem.c-5.us-east-2.aws.neon.tech`, DB `agendapets` |
| **Frontend (otro repo)** | Vercel, proyecto `agenda-pets` | https://agenda-pets-pi.vercel.app |

Antes el servicio de Render **fallaba al construir**: runtime Docker y en GitHub no había `Dockerfile`. La API tampoco estaba endurecida para producción (credenciales en properties, CORS incompleto, sin health).

Después:

- Spring Boot corre en Docker, escucha `0.0.0.0:$PORT` y usa Neon por variables de entorno.
- CORS permite el origen de Vercel.
- `GET /api/health` → `{"status":"ok","service":"agendapets-api"}`.

### Cuentas semilla (`DataInitializer`)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | `admin@agendapets.com` | `admin123` |
| CLIENTE | `carlos.perez@email.com` | `cliente123` |

---

## 2. Cómo encaja este repo

Hay **dos repositorios Git**, no un monorepo:

```
Navegador  →  Vercel (repo AgendaPets)
                 │
                 ▼
              Render  (este repo: Backend_AgendaPets)
                 │  JDBC, host DIRECTO (sin -pooler)
                 ▼
              Neon PostgreSQL  (misma cuenta; no es un tercer repo)
```

Este repo contiene el backend **y** la configuración de conexión a la DB. Neon no tiene código: las tablas las crea Hibernate (`ddl-auto=update`) y el seed `DataInitializer`.

---

## 3. Commits de esta salida

Rama `main`:

1. `434dd7a` — *Deja la API lista para producción en Render con Docker, Neon y CORS.*
2. `bae0fdb` — *Quita el usuario in-memory de Spring en el perfil de producción.*

---

## 4. Docker en Render

| Campo | Valor |
|-------|--------|
| Runtime | Docker, `./Dockerfile` |
| Región | Ohio |
| Plan | Free |
| Branch | `main` |
| Auto-deploy | Activado (si el webhook no dispara, redeploy manual) |

Sin `Dockerfile` el deploy quedaba en `build_failed`. Se añadió:

- `Dockerfile` — multi-stage Temurin 17, JAR `agendapets.jar`, bind `0.0.0.0:$PORT`
- `.dockerignore`
- `pom.xml` — `<finalName>agendapets</finalName>` para que el `COPY` del JAR coincida

**Plan free:** tras ~15 minutos sin tráfico Render apaga el proceso. El primer request siguiente puede tardar ~1 minuto (arranque de Spring ~90 s). Después el flujo es normal.

---

## 5. Neon (base de datos)

| Campo | Valor |
|-------|--------|
| Proyecto | AgendaPets (`still-flower-10770367`) |
| Región | `aws-us-east-2` |
| Base | `agendapets` |
| Rol | `neondb_owner` |
| Host **correcto para Hikari** | `ep-old-moon-aynusiem.c-5.us-east-2.aws.neon.tech` |
| JDBC | `jdbc:postgresql://ep-old-moon-aynusiem.c-5.us-east-2.aws.neon.tech/agendapets?sslmode=require` |

**No usar el hostname `-pooler`.** El pooler de Neon (PgBouncer) y el pool de Hikari se pisan; las conexiones se caen o se quedan colgadas.

Scale-to-zero de Neon está desactivado (`suspend_timeout_seconds: 0`) para que la DB no duerma junto con Render.

Hibernate crea/actualiza esquema. En esta salida se añadió `servicios.visible` (boolean, default true).

---

## 6. Variables de entorno en Render

`application.properties` **ya no** lleva URL, usuario ni clave de Neon en el código.

| Variable | Uso |
|----------|-----|
| `SPRING_DATASOURCE_URL` | JDBC a Neon (**host directo**, sin `-pooler`) |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | Solo en Render, nunca en Git |
| `JWT_SECRET` | ≥ 32 caracteres; obligatorio con perfil `prod` |
| `CORS_ALLOWED_ORIGINS` | `https://agenda-pets-pi.vercel.app,https://*.vercel.app` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `APP_SEED_ENABLED` | `true` (idempotente) |
| `PORT` | Lo inyecta Render |

`.env.example` quedó con placeholders. La contraseña que antes estaba en ese archivo se sacó del repo.

`application-prod.properties`: exige `JWT_SECRET`, apaga SQL logs, `spring.jpa.open-in-view=false`.

---

## 7. Seguridad y CORS

- Públicos: `GET /api/health`, `GET /health`, `GET /api/servicios/**`, `GET /api/reservas/ocupadas`, `POST /api/auth/login`, `POST /registro`.
- CORS con `allowedOriginPatterns` desde `CORS_ALLOWED_ORIGINS`.
- `JwtService` falla al arrancar si el secreto tiene menos de 32 caracteres.
- `AgendapetsApplication` excluye `UserDetailsServiceAutoConfiguration` (sin usuario in-memory de Spring en prod).
- Login/registro aceptan alias JSON `email` / `password` además de `correo` / `contrasena`.
- Correo duplicado → `409` (`UsuarioDuplicadoException`).

El cliente **cancela** con `PATCH /api/reservas/{id}/estado` `{ "estado": "CANCELADA" }`. `DELETE` de reservas sigue siendo solo ADMIN.

---

## 8. Contratos nuevos o ajustados para el front

| Cambio | Para qué |
|--------|----------|
| `GET /api/health` y `GET /health` | Health check de Render |
| `GET /api/reservas/ocupadas` | Calendario público: `{ id, fecha, hora }` (sin datos de otros clientes) |
| `parseTamano` | La UI envía `Pequeño`; el enum es `Pequeno` |
| Columna `servicios.visible` | Ocultar en admin sin borrar; el GET público no lista ocultos |
| Duración en texto (`"1 hora"`) | Se parsea a minutos al crear/editar servicio |

Detalle de endpoints y roles: [documentacion.md](documentacion.md).

---

## 9. Qué se verificó en la API (producción)

| Prueba | Resultado |
|--------|-----------|
| `GET /api/health` | 200, `status: ok` |
| `GET /api/servicios` (sin token) | 200, catálogo semilla |
| `GET /api/reservas/ocupadas` | 200 |
| `POST /api/auth/login` admin y cliente | 200 + JWT |
| `POST /api/reservas` (cliente, `tamano` Pequeño) | 201, persistido en Neon |
| `PATCH /api/reservas/{id}/estado` CANCELADA | 200 |
| `POST /registro` | 201 |
| Preflight CORS desde `https://agenda-pets-pi.vercel.app` | origen permitido |

---

## 10. Archivos de este repo

- `Dockerfile`, `.dockerignore`, `.env.example`, `.gitignore`, `pom.xml`
- `src/main/resources/application.properties`, `application-prod.properties`
- `AgendapetsApplication.java`, `SecurityConfig.java`, `JwtService.java`, `DataInitializer.java`
- `HealthController.java`, `ReservaController.java`
- `ReservaService.java`, `ServicioService.java`, `UsuarioService.java`, `AuthService.java`
- `Servicio.java`, `ServicioRequestDTO.java`, `LoginRequestDTO.java`, `UsuarioRequestDTO.java`

No se suben `.env` ni secretos reales.

---

## 11. Operación

```bash
./mvnw spring-boot:run
```

```bash
curl https://agendapets-api.onrender.com/api/health

curl -X POST https://agendapets-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@agendapets.com","contrasena":"admin123"}'
```

---

## 12. Pendiente (este repo / Neon)

- Plan de pago en Render si la API no debe dormir.
- Rotar la contraseña de Neon (estuvo en un `.env.example` antiguo) y actualizarla **solo** en Render.

El auto-deploy de Vercel no se configura aquí; está documentado en el repo del frontend.

---

*Backend_AgendaPets — Render + Neon.*
