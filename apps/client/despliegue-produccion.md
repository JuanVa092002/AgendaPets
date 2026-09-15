# Despliegue a producción — Frontend

> Repo: [AgendaPets/AgendaPets](https://github.com/AgendaPets/AgendaPets)  
> Fecha: **15 de septiembre de 2026**  
> Este archivo documenta **solo** la web estática (Vercel) y cómo habla con la API. El backend y la base de datos están en el otro repo: [AgendaPets/Backend_AgendaPets](https://github.com/AgendaPets/Backend_AgendaPets) (`despliegue-produccion.md`).

---

## 1. Resultado

| Pieza | Dónde | URL |
|-------|--------|-----|
| **Esta web** | Vercel, proyecto `agenda-pets` | https://agenda-pets-pi.vercel.app |
| **API (otro repo)** | Render, `agendapets-api` | https://agendapets-api.onrender.com |

Antes el sitio en Vercel (y GitHub Pages) era estático: usuarios, servicios y citas vivían en `localStorage`. No había sesión JWT ni reservas compartidas entre clientes.

Después:

- Login, registro, catálogo, reservas y cancelaciones van a la API.
- En local (`localhost` / `127.0.0.1`) el front apunta a `http://localhost:8080`.
- En Vercel apunta a `https://agendapets-api.onrender.com`.

### Cuentas de prueba (las crea el backend)

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | `admin@agendapets.com` | `admin123` |
| CLIENTE | `carlos.perez@email.com` | `cliente123` |

El panel admin (`VAdmin/mis-servicios.html`) exige sesión con token y rol admin.

---

## 2. Cómo encaja este repo

Hay **dos repositorios Git**, no un monorepo:

```
Navegador
    │
    ▼
Vercel  (este repo: AgendaPets — HTML/CSS/JS)
    js/config.js  →  apiUrl producción o localhost
    js/api.js     →  fetch + header Authorization: Bearer <JWT>
    │
    ▼
Render + Neon  (repo Backend_AgendaPets — no está en este árbol)
```

Este repo **no** contiene Spring ni SQL. Solo consume la API.

---

## 3. Commit de esta salida

Rama `main`:

- `6e1ce4d` — *Conecta el frontend a la API de producción para reservas reales.*

Proyecto Vercel: `agenda-pets` (`prj_zhLw46C1tmbNQHicRpUPfr4ra7Va`), equipo `juan-carlos-pastas-valencias-projects`, framework Other (estático).

El deploy de producción se hizo con CLI (`vercel --prod`) desde la raíz de este repo. **Aún no** está ligado a GitHub: un `git push` a `main` no publica solo. Hay que volver a desplegar con CLI o enlazar el repo en el dashboard de Vercel.

---

## 4. Cliente HTTP

| Archivo | Rol |
|---------|-----|
| `js/config.js` | Define `AGENDA_PETS_CONFIG.apiUrl` |
| `js/api.js` | `AgendaApi`: login, registro, servicios, reservas, ocupadas |
| `vercel.json` | Sitio estático, `cleanUrls: true` |

Todas las páginas que usan sesión cargan **en este orden**: `config.js` → `api.js` → `auth.js`. En el panel admin las rutas son `../js/`.

La sesión en `localStorage` (`sesion`) guarda `token`, `usuarioId`, `email`, `nombre` y `rol`. El backend manda `ADMIN` / `CLIENTE`; `auth.js` normaliza a admin para el panel.

Ya no se usan como fuente de verdad las claves `usuarios`, `servicios` ni `citas` en `localStorage`.

---

## 5. Pantallas conectadas

| Pantalla | Archivos | Qué hace contra la API |
|----------|----------|------------------------|
| Inicio / auth modal | `js/auth.js` | `POST /api/auth/login`, `POST /registro` |
| Iniciar sesión | `js/iniciarSesion.js` | Login async; admin va a `VAdmin/mis-servicios.html` |
| Reservar | `js/reservar.js` | `GET /api/servicios`, `GET /api/reservas/ocupadas`, `POST` / `PUT /api/reservas` |
| Mis citas | `js/citas.js` | `GET /api/reservas`; cancelar `PATCH /api/reservas/{id}/estado` `{ estado: CANCELADA }` |
| Panel admin | `js/admin.js` | CRUD ` /api/servicios` (token ADMIN) |

**Tamaño de mascota:** el select envía `Pequeño`; el backend lo mapea a `Pequeno`.

**Horarios ocupados:** el calendario usa `ocupadas` (fecha + hora). No pinta nombres de mascotas ajenas.

**Reprogramar:** `reservar.html?reprogramar=<id>` carga la cita del usuario y hace `PUT /api/reservas/{id}`.

---

## 6. Páginas que cargan el cliente

- `index.html`, `iniciarSesion.html`, `reservar.html`, `citas-usuario.html`
- `contacto.html`, `sobre-nosotros.html`
- `VAdmin/mis-servicios.html`

`reservar.js` y `citas.js` dejaron de ser `type="module"` para poder usar `AgendaApi` global.

---

## 7. Rutas en Vercel (comprobadas 200)

`/`, `/reservar`, `/iniciarSesion`, `/citas-usuario`, `/VAdmin/mis-servicios`

`js/config.js` en producción apunta a `https://agendapets-api.onrender.com`.

---

## 8. Desarrollo local

1. API del otro repo en `http://localhost:8080`.
2. Servir este repo (Live Server, `npx serve`, etc.) en `localhost`.
3. `config.js` detecta el host y usa el API local.

Si abres el HTML como archivo (`file://`) o en un host que no sea localhost, el front pegará a Render.

`.gitignore` ignora `.vercel`, `.env` y `.env.local`. No commitear la carpeta `.vercel` ni tokens de CLI.

---

## 9. Contrato mínimo con la API

El front asume:

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/login` | No |
| POST | `/registro` | No |
| GET | `/api/servicios` | No (públicos; ocultos no vienen) |
| GET | `/api/reservas/ocupadas` | No |
| GET / POST / PUT | `/api/reservas` | JWT |
| PATCH | `/api/reservas/{id}/estado` | JWT |
| POST / PUT / DELETE | `/api/servicios` | JWT ADMIN |

Si CORS o el API fallan, `api.js` muestra un error de conexión (típico en el primer hit si Render está dormido, ~1 min en plan free).

Detalle de la API y Neon: documento del repo backend.

---

## 10. Archivos de este repo

- Nuevos: `js/config.js`, `js/api.js`, `vercel.json`
- `js/auth.js`, `js/iniciarSesion.js`, `js/admin.js`, `js/reservar.js`, `js/citas.js`
- HTML listados arriba, `.gitignore`

---

## 11. Pendiente (este repo)

- Enlazar Vercel a `AgendaPets/AgendaPets` para publicar en cada push a `main`.
- Actualizar badges del `readme.md` (aún apuntan a GitHub Pages).

---

*AgendaPets (frontend) — Vercel + consumo de la API.*
