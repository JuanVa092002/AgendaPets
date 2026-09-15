<div align="center">

# 🐾 AgendaPets - Backend API

**Backend REST API para la plataforma de reservas de pet grooming**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-autenticación-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## Descripción

**AgendaPets** es una plataforma web para gestionar reservas de servicios de pet grooming. Este repositorio contiene el **backend**, una API REST con Spring Boot que maneja usuarios, mascotas, servicios y reservas con autenticación JWT y control de roles.

---

## Deploy

| Componente | Plataforma | Estado |
|------------|-----------|--------|
| Frontend | Vercel | 🟢 En desarrollo |
| Backend | Render | 🔜 Pendiente |

> Frontend conectado con el backend: [https://agenda-pets-pi.vercel.app/](https://agenda-pets-pi.vercel.app/)

---

## Organización

| Repositorio | Descripción |
|-------------|-------------|
| [AgendaPets/AgendaPets](https://github.com/AgendaPets/AgendaPets) | Frontend (HTML, CSS, JS) |
| [AgendaPets/Backend_AgendaPets](https://github.com/AgendaPets/Backend_AgendaPets) | Backend (Spring Boot) — este repositorio |

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Lenguaje | Java | 17 |
| Framework | Spring Boot | 3.3.4 |
| Seguridad | Spring Security + JWT | jjwt 0.12.6 |
| ORM | Hibernate / JPA | Spring Data |
| Base de Datos | PostgreSQL | Neon Cloud |
| Pool de Conexiones | HikariCP | Embebido en Spring Boot |
| Encriptación | BCrypt | Contraseñas hasheadas |
| Validación | Jakarta Validation | Bean Validation |
| Build Tool | Apache Maven | 3.9.16 |
| Contenedor | Docker | Multi-stage build |
| Librería util | Lombok | Gestión automática de código |

---

## Cómo Ejecutar Localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/AgendaPets/Backend_AgendaPets.git
cd Backend_AgendaPets
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` como `.env` y completa los valores:

```bash
cp .env.example .env
```

O ejecuta directamente en PowerShell:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://TU_HOST/agendapets?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME="TU_USUARIO"
$env:SPRING_DATASOURCE_PASSWORD="TU_PASSWORD"
$env:JWT_SECRET="tu-clave-secreta-de-al-menos-32-caracteres"
```

### 3. Ejecutar la aplicación

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

La API estará disponible en: `http://localhost:8080`

> Al iniciar, se crean automáticamente datos de prueba (usuarios, servicios, mascotas y reservas). Las contraseñas se almacenan hasheadas con BCrypt.

---

## Endpoints Principales

### Autenticación (Públicos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/registro` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Usuarios (ADMIN)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar todos |
| GET | `/api/usuarios/{id}` | Obtener por ID |
| PUT | `/api/usuarios/{id}` | Actualizar |
| DELETE | `/api/usuarios/{id}` | Eliminar |

### Mascotas (CLIENTE/ADMIN)

| Método | Endpoint | Descripción | Filtros |
|--------|----------|-------------|---------|
| GET | `/api/mascotas` | Listar | `?correo=` o `?usuarioId=` |
| POST | `/api/mascotas` | Crear | — |
| PUT | `/api/mascotas/{id}` | Actualizar | — |
| DELETE | `/api/mascotas/{id}` | Eliminar | — |

### Servicios

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/servicios` | Listar todos | Público |
| POST | `/api/servicios` | Crear | ADMIN |
| PUT | `/api/servicios/{id}` | Actualizar | ADMIN |
| DELETE | `/api/servicios/{id}` | Eliminar | ADMIN |

### Reservas (CLIENTE/ADMIN)

| Método | Endpoint | Descripción | Filtros |
|--------|----------|-------------|---------|
| GET | `/api/reservas` | Listar | `?correo=` o `?usuarioId=` |
| POST | `/api/reservas` | Crear | — |
| PUT | `/api/reservas/{id}` | Actualizar | — |
| PATCH | `/api/reservas/{id}/estado` | Cambiar estado | `{ "estado": "CONFIRMADA" }` |
| DELETE | `/api/reservas/{id}` | Eliminar | — |

> **Nota:** Los campos `email`/`password` también son aceptados en login y registro (además de `correo`/`contrasena`).

---

## Roles y Permisos

| Acción | ADMIN | CLIENTE |
|--------|-------|---------|
| Ver/editar/eliminar usuarios | ✅ | ❌ |
| Crear/editar/eliminar servicios | ✅ | ❌ |
| Ver catálogo de servicios | ✅ | ✅ |
| Crear mascotas | ✅ | ✅ (propias) |
| Editar mascotas | ✅ | ✅ (propias) |
| Crear reservas | ✅ | ✅ (con propias mascotas) |
| Cambiar estado de reservas | ✅ | ✅ (propias) |
| Eliminar reservas | ✅ | ❌ |

> **Ownership:** Los usuarios CLIENTE solo pueden acceder a sus propias mascotas y reservas. El sistema valida esto automáticamente.

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
| Docker | Contenedorización para deploy |
| Patrón de capas | Arquitectura escalable y mantenible |

---

## Equipo de Desarrollo (Bootcamp Generation)

- Juan Carlos Pastas
- Carol Piñeros
- Diego Rojas
- Juan Camilo Acevedo
- Valería Díaz

---

<div align="center">

### 🐾 AgendaPets

**Plataforma de reservas para pet grooming**

</div>
