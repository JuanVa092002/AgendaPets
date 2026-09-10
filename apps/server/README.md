<div align="center">

# 🐾 AgendaPets - Backend API

**Backend REST API para la plataforma de reservas de servicios de pet grooming**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Maven](https://img.shields.io/badge/Maven-3.9.16-C71A36?style=for-the-badge&logo=apache&logoColor=white)](https://maven.apache.org)
[![JWT](https://img.shields.io/badge/JWT-autenticación-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

</div>

## Descripción del Proyecto

**AgendaPets** es una plataforma web enfocada en la gestión de reservas para servicios de pet grooming, diseñada para optimizar procesos, mejorar la experiencia del usuario y garantizar el bienestar de las mascotas.

Este repositorio contiene el **backend** de la aplicación actual, una API REST construida con Spring Boot que gestiona el ciclo completo de reservas: usuarios, mascotas, servicios y reservas.

> **Próximo desarrollo:** Integración con el frontend AgendaPets actualmente en desarrollo, para conformar la aplicación completa.

---

## Descripción General

El backend permite:

- **Registrar e iniciar sesión** como usuario (ADMIN o CLIENTE) con **autenticación JWT**
- **Gestionar mascotas**: registrar, editar y eliminar mascotas asociadas a un cliente
- **Administrar servicios**: catálogo de servicios de peluquería con precios y duraciones
- **Crear y gestionar reservas**: agendar servicios para mascotas con seguimiento de estados
- **Consultar información**: búsqueda por correo, por usuario, por fecha y por estado

---

## Arquitectura

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Lenguaje | Java | 17 |
| Framework | Spring Boot | 3.3.4 |
| Seguridad | Spring Security + JWT | Autenticación por tokens |
| ORM | Hibernate / JPA | (via Spring Data) |
| Base de Datos | PostgreSQL | Neon Cloud |
| Pool de Conexiones | HikariCP | (embebido en Spring Boot) |
| Autenticación | JWT (jjwt) | 0.12.6 |
| Encriptación | BCrypt | Contraseñas hasheadas |
| Validación | Jakarta Validation | Bean Validation |
| Build Tool | Apache Maven | 3.9.16 |
| Librería util | Lombok | (gestión automática de código) |

### Patrón de Arquitectura: Capas (Layered Architecture)

```
┌─────────────────────────────────────────────────┐
│                  CONTROLLERS                     │
│         Reciben peticiones HTTP REST             │
│    GET / POST / PUT / DELETE / PATCH             │
├─────────────────────────────────────────────────┤
│                  SERVICES                        │
│          Reglas de negocio y validaciones        │
│         Orquestan operaciones entre repos        │
├─────────────────────────────────────────────────┤
│                 REPOSITORIES                     │
│        Acceso a datos (Spring Data JPA)          │
│      Comunicación con la base de datos           │
├─────────────────────────────────────────────────┤
│              ENTITIES (MODEL)                    │
│      Representan las tablas de la BD             │
│         Mapeadas con JPA/Hibernate               │
├─────────────────────────────────────────────────┤
│         BASE DE DATOS (PostgreSQL Neon)          │
│            Almacenamiento persistente             │
└─────────────────────────────────────────────────┘
```

### Modelo de Datos (Diagrama ER)

```
┌──────────────┐       ┌──────────────┐
│   USUARIOS   │       │   SERVICIOS  │
│──────────────│       │──────────────│
│ usuario_id   │       │ servicio_id  │
│ nombre       │       │ nombre       │
│ correo       │       │ descripcion  │
│ contrasena   │       │ precio       │
│ estado       │       │ duracion     │
│ rol          │       └──────┬───────┘
└──────┬───────┘              │
       │ 1:N                  │ N:N
       ▼                      ▼
┌──────────────┐    ┌─────────────────────┐
│   MASCOTAS   │    │  RESERVA_SERVICIOS  │
│──────────────│    │  (tabla intermedia) │
│ mascota_id   │    │  reserva_id (FK)    │
│ nombre       │    │  servicio_id (FK)   │
│ tipo         │    └──────────┬──────────┘
│ raza         │               │
│ tamano       │               │ N:N
│ notas        │               │
│ usuario_id(FK│    ┌──────────┴──────────┐
└──────┬───────┘    │      RESERVAS       │
       │ 1:N        │─────────────────────│
       └───────────▶│ reserva_id          │
                    │ fecha               │
                    │ hora                │
                    │ estado              │
                    │ mascota_id (FK)     │
                    └─────────────────────┘
```

### Estados de una Reserva

```
PENDIENTE → CONFIRMADA → COMPLETADA
                ↓
            CANCELADA
```

---

## Estructura del Proyecto

```
Backend_AgendaPets/
├── pom.xml                           # Dependencias y configuración Maven
├── mvnw / mvnw.cmd                   # Maven Wrapper (ejecutar sin instalar Maven)
├── .env.example                      # Plantilla de variables de entorno
├── README.md                         # Documentación principal
├── documentacion.md                  # Documentación detallada para developers
│
└── src/main/java/com/agendapets/agendapets/
    │
    ├── AgendapetsApplication.java    # Punto de entrada (@SpringBootApplication)
    │
    ├── config/
    │   ├── SecurityConfig.java       # JWT + RBAC + BCrypt + CORS
    │   └── DataInitializer.java      # Seed data: crea datos de prueba al iniciar
    │
    ├── security/                     # Componentes de autenticación JWT
    │   ├── JwtService.java           # Generación y validación de tokens
    │   └── JwtAuthenticationFilter.java  # Filtro que intercepta cada request
    │
    ├── exception/                    # Manejo centralizado de errores
    │   ├── GlobalExceptionHandler.java    # Captura excepciones → JSON
    │   ├── ResourceNotFoundException.java # 404
    │   ├── CredencialesInvalidasException.java  # 401
    │   └── UsuarioDuplicadoException.java  # 409
    │
    ├── model/                        # Entidades JPA (tablas de la BD)
    │   ├── Usuario.java              # tabla "usuarios"
    │   ├── Mascota.java              # tabla "mascotas"
    │   ├── Servicio.java             # tabla "servicios"
    │   ├── Reserva.java              # tabla "reservas"
    │   ├── TipoMascota.java          # Enum: Perro, Gato
    │   └── TamanoMascota.java        # Enum: Pequeno, Mediano, Grande
    │
    ├── repository/                   # Acceso a datos (interfaces JPA)
    │   ├── UsuarioRepository.java
    │   ├── MascotaRepository.java
    │   ├── ServicioRepository.java
    │   └── ReservaRepository.java
    │
    ├── service/                      # Lógica de negocio
    │   ├── AuthService.java          # Login con JWT
    │   ├── UsuarioService.java       # CRUD + registro
    │   ├── MascotaService.java       # CRUD + búsqueda por correo/usuario
    │   ├── ServicioService.java      # CRUD de servicios
    │   └── ReservaService.java       # CRUD + cambio de estado + consultas
    │
    ├── controller/                   # Endpoints REST
    │   ├── AuthController.java       # POST /api/auth/login
    │   ├── UsuarioController.java    # /registro, /usuarios
    │   ├── MascotaController.java    # /mascotas
    │   ├── ServicioController.java   # /servicios
    │   └── ReservaController.java    # /reservas, /reservas/{id}/estado
    │
    └── dto/                          # Data Transfer Objects
        ├── AuthResponseDTO.java      # Respuesta del login (token + datos)
        ├── LoginRequestDTO.java
        ├── UsuarioRequestDTO.java    ├── UsuarioResponseDTO.java
        ├── MascotaRequestDTO.java    ├── MascotaResponseDTO.java
        ├── ServicioRequestDTO.java   ├── ServicioResponseDTO.java
        └── ReservaRequestDTO.java    └── ReservaResponseDTO.java
```

---

## Autenticación JWT

### Flujo de autenticación

```
1. Registro:  POST /registro { nombre, correo, contrasena }
              → BCrypt hashea la contraseña → guarda en BD

2. Login:     POST /api/auth/login { correo, contrasena }
              → Busca usuario por correo
              → BCrypt.matches() compara contraseña
              → JwtService.generarToken() → JWT con subject=correo, claim=rol
              → Retorna { token, tipo, usuarioId, nombre, correo, rol }

3. Request:   GET /api/mascotas
              Authorization: Bearer eyJhbGci...
              → JwtAuthenticationFilter extrae token
              → JwtService.extraerCorreo() → correo
              → UsuarioRepository.findByCorreo() → usuario
              → SecurityContextHolder.setAuthentication(ROLE_CLIENTE)
              → SecurityConfig verifica permisos
```

### Ejemplo de respuesta de login

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "usuarioId": 2,
  "nombre": "Carlos Pérez",
  "correo": "carlos.perez@email.com",
  "rol": "CLIENTE"
}
```

---

## Endpoints Disponibles

### Autenticación (Públicos)

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/registro` | Registrar nuevo usuario | `{ nombre, correo, contrasena }` |
| POST | `/api/auth/login` | Iniciar sesión | `{ correo, contrasena }` |

### Usuarios (ADMIN)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/usuarios` | Listar todos | ADMIN |
| GET | `/api/usuarios/{id}` | Obtener por ID | ADMIN |
| PUT | `/api/usuarios/{id}` | Actualizar | ADMIN |
| DELETE | `/api/usuarios/{id}` | Eliminar | ADMIN |

### Mascotas (CLIENTE/ADMIN)

| Método | Endpoint | Descripción | Acceso | Filtros |
|--------|----------|-------------|--------|---------|
| GET | `/api/mascotas` | Listar | Autenticado | `?correo=` o `?usuarioId=` |
| GET | `/api/mascotas/{id}` | Obtener por ID | Autenticado | - |
| POST | `/api/mascotas` | Crear | CLIENTE/ADMIN | - |
| PUT | `/api/mascotas/{id}` | Actualizar | Autenticado | - |
| DELETE | `/api/mascotas/{id}` | Eliminar | Autenticado | - |

### Servicios

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/servicios` | Listar todos | Público |
| GET | `/api/servicios/{id}` | Obtener por ID | Autenticado |
| POST | `/api/servicios` | Crear | ADMIN |
| PUT | `/api/servicios/{id}` | Actualizar | ADMIN |
| DELETE | `/api/servicios/{id}` | Eliminar | ADMIN |

### Reservas (CLIENTE/ADMIN)

| Método | Endpoint | Descripción | Acceso | Filtros |
|--------|----------|-------------|--------|---------|
| GET | `/api/reservas` | Listar | Autenticado | `?correo=` o `?usuarioId=` |
| GET | `/api/reservas/{id}` | Obtener por ID | Autenticado | - |
| POST | `/api/reservas` | Crear | CLIENTE/ADMIN | - |
| PUT | `/api/reservas/{id}` | Actualizar | Autenticado | - |
| PATCH | `/api/reservas/{id}/estado` | Cambiar estado | CLIENTE/ADMIN | `{ "estado": "CONFIRMADA" }` |
| DELETE | `/api/reservas/{id}` | Eliminar | Autenticado | - |

---

## Requisitos Previos

- **Java 17** (JDK Temurin 17 recomendado: https://adoptium.net/temurin/releases/?version=17)
- **Conexión a internet** (para conectar con Neon PostgreSQL)

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Backend_AgendaPets.git
cd Backend_AgendaPets
```

### 2. Configurar variables de entorno (opcional)

```powershell
# Windows PowerShell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://..."
$env:SPRING_DATASOURCE_USERNAME="..."
$env:SPRING_DATASOURCE_PASSWORD="..."
$env:JWT_SECRET="tu-clave-secreta-de-al-menos-32-caracteres"
```

> Si no se configuran, se usan los valores por defecto en `application.properties`

### 3. Ejecutar la aplicación

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### 4. Verificar

La aplicación estará disponible en: `http://localhost:8080`

Al iniciar, se crean automáticamente datos de prueba (contraseñas hasheadas con BCrypt):
- 4 usuarios (1 admin + 3 clientes)
- 5 servicios de peluquería
- 4 mascotas
- 4 reservas con diferentes estados

---

## Pruebas con curl

### 1. Registrar usuario

```bash
curl -X POST http://localhost:8080/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","correo":"juan@email.com","contrasena":"123456"}'
```

### 2. Iniciar sesión

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"carlos.perez@email.com","contrasena":"cliente123"}'
```

### 3. Usar token en endpoints protegidos

```bash
# Reemplazar <TOKEN> con el token obtenido en el login
curl http://localhost:8080/api/mascotas \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Datos de Prueba (Seed Data)

### Usuarios

| Nombre | Correo | Contraseña | Rol |
|--------|--------|------------|-----|
| Peluquería Canina Admin | admin@agendapets.com | admin123 | ADMIN |
| Carlos Pérez | carlos.perez@email.com | cliente123 | CLIENTE |
| Laura Gómez | laura.gomez@email.com | cliente123 | CLIENTE |
| Ana Martínez | ana.martinez@email.com | cliente123 | CLIENTE (inactiva) |

> **Nota:** Las contraseñas se almacenan hasheadas con BCrypt. Los datos de prueba se crean automáticamente al iniciar la aplicación.

### Servicios

| Servicio | Precio | Duración |
|----------|--------|----------|
| Baño Básico | $35.000 | 45 min |
| Corte de Pelo | $45.000 | 60 min |
| Corte de Uñas | $15.000 | 15 min |
| Limpieza de Oídos | $12.000 | 15 min |
| Servicio Completo Spa | $85.000 | 90 min |

---

## Documentación Adicional

Para una explicación detallada de cada componente del proyecto, consulta:

📄 **[documentacion.md](documentacion.md)** - Guía completa para desarrolladores junior que incluye:
- Explicación detallada de cada capa (Controller, Service, Repository, Model)
- Modelo de datos completo
- Flujo de autenticación JWT explicado paso a paso
- Tabla de permisos por rol
- Ejemplos de uso con curl
- Errores comunes y soluciones
- Glosario de términos

---

## Roadmap - Escalabilidad a Futuro

### Fase 1: Seguridad ✅

- [x] Hashing de contraseñas con BCrypt
- [x] Autenticación JWT (tokens de sesión)
- [x] Autorización por roles (ADMIN vs CLIENTE)
- [x] Protección de endpoints según el rol
- [x] Manejo centralizado de errores (GlobalExceptionHandler)

### Fase 2: Funcionalidad

- [ ] Sistema de notificaciones (email/SMS al confirmar reserva)
- [ ] Calendario visual de disponibilidad
- [ ] Sistema de reseñas y calificaciones
- [ ] Gestión de horarios y disponibilidad del negocio
- [ ] Página de perfil del cliente con historial

### Fase 3: Integración Frontend

- [ ] Integración con frontend AgendaPets (en desarrollo)
- [ ] Interfaz web con React / Angular / Vue
- [ ] Panel administrativo completo
- [ ] Dashboard con estadísticas del negocio

### Fase 4: Infraestructura

- [ ] Tests unitarios y de integración
- [ ] CI/CD con GitHub Actions
- [ ] Deploy automático (Render / Railway / AWS)
- [ ] Monitorización y logging estructurado

### Fase 5: Expansión

- [ ] App móvil con Flutter / React Native
- [ ] Sistema de pagos integrado
- [ ] Múltiples sucursales
- [ ] API pública para terceros

---

## Tecnologías y Conceptos Aprendidos

| Concepto | Dónde se aplica |
|----------|-----------------|
| Spring Boot | Framework principal para crear la API REST |
| Spring Data JPA | Acceso a datos con repositorios |
| Spring Security | Autenticación JWT y autorización por roles |
| Hibernate | ORM que traduce Java a SQL |
| PostgreSQL (Neon) | Base de datos relacional en la nube |
| HikariCP | Pool optimizado de conexiones |
| JWT (jjwt) | Tokens de autenticación stateless |
| BCrypt | Encriptación de contraseñas |
| Jakarta Validation | Validación de DTOs con anotaciones |
| Lombok | Reducción de código boilerplate |
| DTOs | Transferencia segura de datos entre capas |
| REST API | Comunicación HTTP estándar |
| Maven | Gestión de dependencias y build |
| Patrón de capas | Arquitectura escalable y mantenible |

---

## Proyecto Asociado

| Repositorio | Descripción | Estado |
|-------------|-------------|--------|
| **Backend_AgendaPets** | API REST (este repositorio) | ✅ Completado |
| **Frontend_AgendaPets** | Aplicación web del cliente | 🛠️ Completada pendiente conexión |

---

<div align="center">

### 🐾 AgendaPets

**Plataforma de reservas para pet grooming**

</div>
