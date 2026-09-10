<div align="center">

<!-- LOGO DEL PROYECTO -->
<!-- <img src="" alt="Logo AgendaPets" width="200"/> -->

# 🐾 AgendaPets - Backend API

**Backend REST API para la plataforma de reservas de servicios de pet grooming**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Maven](https://img.shields.io/badge/Maven-3.9.16-C71A36?style=for-the-badge&logo=apache&logoColor=white)](https://maven.apache.org)

---



</div>

---

## Descripción del Proyecto

**AgendaPets** es una plataforma web enfocada en la gestión de reservas para servicios de pet grooming, diseñada para optimizar procesos, mejorar la experiencia del usuario y garantizar el bienestar de las mascotas.

Este repositorio contiene el **backend** de la aplicación actual, una API REST construida con Spring Boot que gestiona el ciclo completo de reservas: usuarios, mascotas, servicios y reservas.

> **Próximo desarrollo:** Integración con el frontend AgendaPets actualmente en desarrollo, para conformar la aplicación completa.

---

## Descripción General

El backend permite:

- **Registrar e iniciar sesión** como usuario (ADMIN o CLIENTE)
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
| Seguridad | Spring Security | (configurada, endpoints abiertos) |
| ORM | Hibernate / JPA | (via Spring Data) |
| Base de Datos | PostgreSQL | Neon Cloud |
| Pool de Conexiones | HikariCP | (embebido en Spring Boot) |
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
│
└── src/main/java/com/agendapets/agendapets/
    │
    ├── AgendapetsApplication.java    # Punto de entrada (@SpringBootApplication)
    │
    ├── config/
    │   ├── SecurityConfig.java       # Configuración Spring Security (CORS, endpoints)
    │   └── DataInitializer.java      # Seed data: crea datos de prueba al iniciar
    │
    ├── model/                        # Entidades JPA (tablas de la BD)
    │   ├── Usuario.java              # tabla "usuarios"
    │   ├── Mascota.java              # tabla "mascotas"
    │   ├── Servicio.java             # tabla "servicios"
    │   └── Reserva.java              # tabla "reservas"
    │
    ├── repository/                   # Acceso a datos (interfaces JPA)
    │   ├── UsuarioRepository.java
    │   ├── MascotaRepository.java
    │   ├── ServicioRepository.java
    │   └── ReservaRepository.java
    │
    ├── service/                      # Lógica de negocio
    │   ├── UsuarioService.java       # CRUD + login + validaciones
    │   ├── MascotaService.java       # CRUD + búsqueda por correo/usuario
    │   ├── ServicioService.java      # CRUD de servicios
    │   └── ReservaService.java       # CRUD + cambio de estado + consultas
    │
    ├── controller/                   # Endpoints REST
    │   ├── UsuarioController.java    # /registro, /login, /usuarios
    │   ├── MascotaController.java    # /mascotas
    │   ├── ServicioController.java   # /servicios
    │   └── ReservaController.java    # /reservas, /reservas/{id}/estado
    │
    └── dto/                          # Data Transfer Objects
        ├── LoginRequestDTO.java
        ├── UsuarioRequestDTO.java    ├── UsuarioResponseDTO.java
        ├── MascotaRequestDTO.java    ├── MascotaResponseDTO.java
        ├── ServicioRequestDTO.java   ├── ServicioResponseDTO.java
        └── ReservaRequestDTO.java    └── ReservaResponseDTO.java
```

---

## Endpoints Disponibles

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/registro` | Registrar nuevo usuario |
| POST | `/login` | Iniciar sesión (correo + contraseña) |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios` | Listar todos los usuarios |
| GET | `/usuarios/{id}` | Obtener usuario por ID |
| PUT | `/usuarios/{id}` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

### Mascotas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/mascotas` | Listar todas (filtro: `?correo=` o `?usuarioId=`) |
| GET | `/mascotas/{id}` | Obtener mascota por ID |
| POST | `/mascotas` | Crear mascota |
| PUT | `/mascotas/{id}` | Actualizar mascota |
| DELETE | `/mascotas/{id}` | Eliminar mascota |

### Servicios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/servicios` | Listar todos los servicios |
| GET | `/servicios/{id}` | Obtener servicio por ID |
| POST | `/servicios` | Crear servicio |
| PUT | `/servicios/{id}` | Actualizar servicio |
| DELETE | `/servicios/{id}` | Eliminar servicio |

### Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reservas` | Listar todas (filtro: `?correo=` o `?usuarioId=`) |
| GET | `/reservas/{id}` | Obtener reserva por ID |
| POST | `/reservas` | Crear reserva |
| PUT | `/reservas/{id}` | Actualizar reserva |
| PATCH | `/reservas/{id}/estado` | Cambiar estado |
| DELETE | `/reservas/{id}` | Eliminar/cancelar reserva |

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

```bash
# En Linux/Mac
export SPRING_DATASOURCE_URL=jdbc:postgresql://...
export SPRING_DATASOURCE_USERNAME=...
export SPRING_DATASOURCE_PASSWORD=...

# En Windows (PowerShell)
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://..."
$env:SPRING_DATASOURCE_USERNAME="..."
$env:SPRING_DATASOURCE_PASSWORD="..."
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

Al iniciar, se crean automáticamente datos de prueba:
- 4 usuarios (1 admin + 3 clientes)
- 5 servicios de peluquería
- 4 mascotas
- 4 reservas con diferentes estados

---

## Datos de Prueba (Seed Data)

### Usuarios

| Nombre | Correo | Contraseña | Rol |
|--------|--------|------------|-----|
| Peluquería Canina Admin | admin@agendapets.com | admin123 | ADMIN |
| Carlos Pérez | carlos.perez@email.com | cliente123 | CLIENTE |
| Laura Gómez | laura.gomez@email.com | cliente123 | CLIENTE |
| Ana Martínez | ana.martinez@email.com | cliente123 | CLIENTE (inactiva) |

### Servicios

| Servicio | Precio | Duración |
|----------|--------|----------|
| Baño Básico | $35.000 | 45 min |
| Corte de Pelo | $45.000 | 60 min |
| Corte de Uñas | $15.000 | 15 min |
| Limpieza de Oídos | $12.000 | 15 min |
| Servicio Completo Spa | $85.000 | 90 min |

---

## Beneficios del Proyecto

### Para el negocio

- **Digitalización del proceso de reservas**: Elimina agenda de papel y llamadas telefónicas
- **Gestión centralizada**: Usuarios, mascotas, servicios y reservas en un solo lugar
- **Seguimiento del estado**: Las reservas tienen estados claros (PENDIENTE → CONFIRMADA → COMPLETADA)
- **Historial completo**: Cada cliente tiene registrado su historial de servicios y mascotas
- **Toma de decisiones**: Consultas SQL para ver servicios más solicitados e ingresos

### Para el desarrollo

- **Arquitectura escalable**: Patrón de capas que permite crecer sin reescribir código
- **Código limpio**: Separación de responsabilidades (Controller → Service → Repository)
- **DTOs**: Separación entre modelo interno y lo que se expone al exterior
- **Seed data**: Datos de prueba listos para demostrar funcionalidad
- **CORS habilitado**: Listo para conectarse con cualquier frontend

---

## Roadmap - Escalabilidad a Futuro

### Fase 1: Seguridad

- [ ] Hashing de contraseñas con BCrypt
- [ ] Autenticación JWT (tokens de sesión)
- [ ] Autorización por roles (ADMIN vs CLIENTE)
- [ ] Protección de endpoints según el rol

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

- [ ] Docker y Docker Compose para despliegue
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
| Spring Security | Configuración de CORS y endpoints |
| Hibernate | ORM que traduce Java a SQL |
| PostgreSQL (Neon) | Base de datos relacional en la nube |
| HikariCP | Pool optimizado de conexiones |
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
