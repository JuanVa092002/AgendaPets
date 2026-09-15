# Documentación Completa - AgendaPets Backend

> **Guía para desarrolladores** - Explicación detallada de cada componente del proyecto.

---

## Tabla de Contenidos

1. [Qué es este proyecto](#1-qué-es-este-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Cómo funciona cada capa](#4-cómo-funciona-cada-capa)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Autenticación JWT](#6-autenticación-jwt)
7. [Autorización por roles](#7-autorización-por-roles)
8. [Endpoints disponibles](#8-endpoints-disponibles)
9. [Flujo de una petición HTTP](#9-flujo-de-una-petición-http)
10. [Cómo ejecutar el proyecto](#10-cómo-ejecutar-el-proyecto)
11. [Datos de prueba](#11-datos-de-prueba)
12. [Pruebas con Postman/curl](#12-pruebas-con-postmancurl)
13. [Errores comunes y soluciones](#13-errores-comunes-y-soluciones)
14. [Glosario de términos](#14-glosario-de-términos)
15. [Auditoría completa (57 pruebas)](#15-auditoría-completa-57-pruebas)
16. [Correcciones pendientes para frontend](#16-correcciones-pendientes-para-frontend)
17. [Roadmap - Escalabilidad a futuro](#17-roadmap---escalabilidad-a-futuro)

---

## 1. Qué es este proyecto

**AgendaPets** es el backend de una aplicación para gestionar reservas de servicios de peluquería canina (pet grooming). Permite:

- Registrar usuarios (ADMIN y CLIENTE)
- Registrar mascotas asociadas a un cliente
- Crear un catálogo de servicios (baño, corte, etc.)
- Crear reservas de servicios para mascotas
- Seguir el estado de cada reserva

### Para qué sirve cada rol

| Rol | Puede hacer |
|-----|-------------|
| **ADMIN** | Control total del negocio: usuarios (ver, editar, eliminar), servicios (crear, editar, eliminar) y **todas** las mascotas y reservas (crear, editar, cambiar estado, eliminar) |
| **CLIENTE** | Registrarse (siempre como CLIENTE), crear y gestionar **solo sus propias** mascotas y reservas (incluida la edición de los servicios de su reserva). No puede crear/editar/eliminar servicios, ni ver o tocar datos de otros usuarios |

---

## 2. Stack tecnológico

| Tecnología | Qué es | Para qué se usa |
|-----------|--------|-----------------|
| **Java 17** | Lenguaje de programación | Escribir el código del backend |
| **Spring Boot 3.3.4** | Framework para crear APIs REST | Crear endpoints HTTP, manejar peticiones |
| **Spring Security** | Framework de seguridad | Autenticar usuarios (JWT) y autorizar endpoints |
| **Spring Data JPA** | Acceso a datos | Comunicarse con la base de datos sin escribir SQL |
| **Hibernate** | ORM (Object-Relational Mapping) | Traducir objetos Java a tablas de base de datos |
| **PostgreSQL (Neon)** | Base de datos relacional | Almacenar usuarios, mascotas, servicios, reservas |
| **HikariCP** | Pool de conexiones | Manejar múltiples conexiones a la BD eficientemente |
| **Lombok** | Librería de utilidad | Reducir código repetitivo (getters, setters, constructores) |
| **JWT (jjwt)** | Tokens de autenticación | Mantener al usuario logueado sin sesiones del servidor |
| **BCrypt** | Algoritmo de hash | Hashear contraseñas (nunca guardarlas en texto plano) |
| **Maven** | Build tool | Gestionar dependencias y compilar el proyecto |

---

## 3. Estructura de carpetas

```
Backend_AgendaPets/
│
├── pom.xml                          # Archivo de configuración de Maven (dependencias)
├── mvnw / mvnw.cmd                  # Scripts para ejecutar Maven sin instalarlo
├── .env.example                     # Plantilla de variables de entorno
├── README.md                        # Documentación principal del proyecto
├── documentacion.md                 # Este archivo (documentación detallada)
│
└── src/main/java/com/agendapets/agendapets/
    │
    ├── AgendapetsApplication.java   # Punto de entrada (main)
    │
    ├── config/                      # Configuración general
    │   ├── SecurityConfig.java      # Seguridad: JWT, roles, CORS
    │   └── DataInitializer.java     # Crea datos de prueba al iniciar
    │
    ├── security/                    # Componentes de seguridad JWT
    │   ├── JwtService.java          # Genera y valida tokens JWT
    │   └── JwtAuthenticationFilter.java  # Filtro que intercepta cada petición
    │
    ├── exception/                   # Manejo de errores
    │   ├── GlobalExceptionHandler.java     # Captura errores y retorna JSON
    │   ├── ResourceNotFoundException.java  # Error 404
    │   ├── CredencialesInvalidasException.java  # Error 401
    │   └── UsuarioDuplicadoException.java  # Error 409
    │
    ├── model/                       # Entidades JPA (tablas de la BD)
    │   ├── Usuario.java             # Tabla "usuarios"
    │   ├── Mascota.java             # Tabla "mascotas"
    │   ├── Servicio.java            # Tabla "servicios"
    │   ├── Reserva.java             # Tabla "reservas"
    │   ├── TipoMascota.java         # Enum: Perro, Gato
    │   └── TamanoMascota.java       # Enum: Pequeno, Mediano, Grande
    │
    ├── dto/                         # Data Transfer Objects (objetos de transferencia)
    │   ├── AuthResponseDTO.java     # Respuesta del login (token + datos)
    │   ├── LoginRequestDTO.java     # Datos de entrada del login
    │   ├── UsuarioRequestDTO.java   # Datos para crear/actualizar usuario
    │   ├── UsuarioResponseDTO.java  # Datos de salida del usuario
    │   ├── MascotaRequestDTO.java   # Datos para crear/actualizar mascota
    │   ├── MascotaResponseDTO.java  # Datos de salida de la mascota
    │   ├── ServicioRequestDTO.java  # Datos para crear/actualizar servicio
    │   ├── ServicioResponseDTO.java # Datos de salida del servicio
    │   ├── ReservaRequestDTO.java   # Datos para crear/actualizar reserva
    │   └── ReservaResponseDTO.java  # Datos de salida de la reserva
    │
    ├── repository/                  # Interfaces de acceso a datos
    │   ├── UsuarioRepository.java   # Consultas de la tabla usuarios
    │   ├── MascotaRepository.java   # Consultas de la tabla mascotas
    │   ├── ServicioRepository.java  # Consultas de la tabla servicios
    │   └── ReservaRepository.java   # Consultas de la tabla reservas
    │
    ├── service/                     # Lógica de negocio
    │   ├── AuthService.java         # Lógica de login (JWT)
    │   ├── UsuarioService.java      # CRUD de usuarios
    │   ├── MascotaService.java      # CRUD de mascotas
    │   ├── ServicioService.java     # CRUD de servicios
    │   └── ReservaService.java      # CRUD de reservas
    │
    └── controller/                  # Endpoints REST
        ├── AuthController.java      # POST /api/auth/login
        ├── UsuarioController.java   # CRUD usuarios + registro
        ├── MascotaController.java   # CRUD mascotas
        ├── ServicioController.java  # CRUD servicios
        └── ReservaController.java   # CRUD reservas
```

---

## 4. Cómo funciona cada capa

### 4.1 Controller (Controlador)

**Qué es:** Recibe las peticiones HTTP del frontend y retorna respuestas JSON.

**Ejemplo simplificado:**
```java
@RestController
public class MascotaController {

    private final MascotaService mascotaService;

    // GET /api/mascotas
    public ResponseEntity<List<MascotaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(mascotaService.listarTodas());
    }

    // POST /api/mascotas
    public ResponseEntity<?> crear(@RequestBody MascotaRequestDTO dto) {
        MascotaResponseDTO nueva = mascotaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }
}
```

**Reglas:**
- Nunca poner lógica de negocio aquí
- Solo recibir datos, llamar al service, y retornar respuesta
- Usar DTOs, nunca entidades directamente

### 4.2 Service (Servicio)

**Qué es:** Contiene la lógica de negocio. Valida datos, ejecuta reglas, y usa el repository.

**Ejemplo simplificado:**
```java
@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;

    public MascotaResponseDTO crear(MascotaRequestDTO dto) {
        // 1. Validar datos
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }

        // 2. Convertir DTO a Entidad
        Mascota mascota = Mascota.builder()
                .nombre(dto.getNombre())
                .raza(dto.getRaza())
                .build();

        // 3. Guardar en BD
        Mascota guardada = mascotaRepository.save(mascota);

        // 4. Convertir Entidad a DTO de respuesta
        return mapToResponseDTO(guardada);
    }
}
```

### 4.3 Repository (Repositorio)

**Qué es:** Interface que extiende JpaRepository. Spring Data JPA genera automáticamente las consultas SQL.

**Ejemplo:**
```java
@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    // Spring genera automáticamente: SELECT * FROM mascotas WHERE usuario_id = ?
    List<Mascota> findByUsuarioUsuarioId(Long usuarioId);

    // Spring genera automáticamente: SELECT * FROM mascotas WHERE usuario_correo ILIKE ?
    List<Mascota> findByUsuarioCorreoIgnoreCase(String correo);
}
```

### 4.4 Model (Modelo/Entidad)

**Qué es:** Clase Java que representa una tabla de la base de datos.

**Ejemplo:**
```java
@Entity
@Table(name = "mascotas")
@Data  // Lombok genera getters, setters, toString, etc.
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMascota;

    private String nombre;
    private String raza;

    @Enumerated(EnumType.STRING)
    private TipoMascota tipo;  // Enum: Perro, Gato

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;  // Relación con Usuario
}
```

### 4.5 DTO (Data Transfer Object)

**Qué es:** Objeto que se envía y recibe en los endpoints. Separa lo que se muestra al exterior de la estructura interna de la BD.

**Por qué se usa:**
- La entidad `Usuario` tiene `contrasena` → NO se debe enviar al frontend
- El DTO `UsuarioResponseDTO` tiene `nombre`, `correo`, `rol` → sí se envía

---

## 5. Modelo de datos

### Tablas y relaciones

```
USUARIOS (1) ──────────> (N) MASCOTAS (1) ──────────> (N) RESERVAS
                                                          │
                                              ┌───────────┴───────────┐
                                              │  RESERVA_SERVICIOS    │
                                              │  (tabla intermedia)   │
                                              └───────────┬───────────┘
                                                          │
                                                          v
                                                     (N) SERVICIOS
```

### Tabla USUARIOS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| usuario_id | BIGINT (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre del usuario |
| correo | VARCHAR(150) | Correo electrónico (único) |
| contrasena | VARCHAR(255) | Contraseña hasheada con BCrypt |
| estado | BOOLEAN | true = activo, false = inactivo |
| rol | ENUM `Rol` | `ADMIN` o `CLIENTE` (valores fijos, previene errores tipográficos) |

### Enum Rol (control de acceso)

El campo `rol` de la tabla USUARIOS usa un **enum** en lugar de un String libre. Esto garantiza que solo existan dos valores válidos: `ADMIN` y `CLIENTE`.

```java
public enum Rol {
    ADMIN,    // Acceso total al negocio
    CLIENTE   // Acceso limitado a sus propias mascotas y reservas
}
```

**Por qué se usa un enum:**
- Si alguien escribe `"admin"`, `"Admin"` o `"ADMINN"`, el compilador lo detecta como error
- Si se envía un valor inválido en un request (por ejemplo `"rol":"INVALIDO"`), el servicio devuelve `400` con el mensaje: `"Rol inválido: INVALIDO. Roles válidos: ADMIN, CLIENTE"`
- En la base de datos se almacena como texto (`VARCHAR(20)`) pero Java lo maneja como tipo seguro

**Nota:** Los DTOs de request/response usan `String` para el campo `rol` por flexibilidad en el JSON. La conversión `String → Rol` ocurre en `UsuarioService` usando `Rol.valueOf()`.

### Tabla MASCOTAS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id_mascota | BIGINT (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre de la mascota |
| raza | VARCHAR(100) | Raza de la mascota |
| tipo | ENUM | "Perro" o "Gato" |
| notas | TEXT | Notas especiales |
| tamano | ENUM | "Pequeno", "Mediano" o "Grande" |
| usuario_id | BIGINT (FK) | Referencia al dueño |

### Tabla SERVICIOS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| servicio_id | BIGINT (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre del servicio |
| descripcion | TEXT | Descripción del servicio |
| precio | DECIMAL | Precio del servicio |
| duracion_servicio | INTEGER | Duración en minutos |

### Tabla RESERVAS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| reserva_id | BIGINT (PK) | Identificador único |
| fecha | DATE | Fecha de la reserva |
| hora | TIME | Hora de la reserva |
| estado | VARCHAR(20) | PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA |
| mascota_id | BIGINT (FK) | Referencia a la mascota |

### Tabla intermedia RESERVA_SERVICIOS

| Columna | Tipo | Descripción |
|---------|------|-------------|
| reserva_id | BIGINT (FK) | Referencia a la reserva |
| servicio_id | BIGINT (FK) | Referencia al servicio |

### Estados de una reserva

```
PENDIENTE → CONFIRMADA → COMPLETADA
                ↓
            CANCELADA
```

---

## 6. Autenticación JWT

### Qué es JWT

JWT (JSON Web Token) es un token que se genera cuando el usuario inicia sesión y se envía en cada petición para identificarlo.

### Flujo de autenticación

```
1. USUARIO SE REGISTRA
   POST /registro
   → La contraseña se hashea con BCrypt
   → Se guarda en la BD

2. USUARIO INICIA SESIÓN
   POST /api/auth/login
   → Se busca el usuario por correo
   → Se compara la contraseña con BCrypt
   → Se genera un token JWT (expira en 8 horas)
   → Se retorna: { token, tipo, usuarioId, nombre, correo, rol }

3. USUARIO ACCede A ENDPOINTS PROTEGIDOS
   GET /api/mascotas
   Header: Authorization: Bearer eyJhbGci...
   → El filtro JWT lee el header
   → Valida el token
   → Busca el usuario en la BD
   → Setea la autenticación en SecurityContext
   → Spring verifica los permisos según el rol
```

> **Nota de seguridad (corregido en esta sesión):** el endpoint `POST /registro` **siempre** crea al usuario con rol `CLIENTE`. Aunque el JSON envíe un campo `rol` (por ejemplo `"rol": "ADMIN"`), ese valor se ignora: `UsuarioService.registrar` asigna `rol = "CLIENTE"` de forma fija. Esto impide que un usuario se auto-registre como administrador (escalada de privilegios). El rol real siempre se lee de la base de datos al validar cada petición, nunca se confía en el contenido del token.

> **Nota (login):** al iniciar sesión, la contraseña ingresada se compara con un hash BCrypt (`passwordEncoder.matches`). Si en la base de datos la contraseña está en **texto plano**, BCrypt no puede coincidir y el login devuelve `401 Usuario o contraseña incorrectos` aunque la contraseña sea correcta. Los usuarios creados con `/registro` siempre guardan el hash correcto, y `DataInitializer` corrige automáticamente las contraseñas en texto plano (ver sección 11).

### Estructura del token JWT

```json
{
  "sub": "carlos.perez@email.com",    // Correo del usuario
  "rol": "CLIENTE",                    // Rol del usuario
  "iat": 1725000000,                   // Fecha de emisión
  "exp": 1725028800                    // Fecha de expiración (8 horas)
}
```

### Archivos JWT

| Archivo | Qué hace |
|---------|----------|
| `JwtService.java` | Genera tokens y extrae el correo de un token |
| `JwtAuthenticationFilter.java` | Intercepta cada petición, lee el header Authorization, valida el token |

### Código de JwtService (simplificado)

```java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;  // Clave secreta para firmar tokens

    // Genera un token con el correo y rol del usuario
    public String generarToken(Usuario usuario) {
        return Jwts.builder()
                .subject(usuario.getCorreo())        // Email en el payload
                .claim("rol", usuario.getRol())      // Rol en el payload
                .expiration(new Date(...))            // Expira en 8 horas
                .signWith(obtenerLlave())             // Firma con la clave secreta
                .compact();
    }

    // Extrae el correo de un token válido
    public String extraerCorreo(String token) {
        return Jwts.parser()
                .verifyWith(obtenerLlave())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
```

### Código de JwtAuthenticationFilter (simplificado)

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // 1. Leer header Authorization
        String header = request.getHeader("Authorization");

        // 2. Si no hay header o no empieza con "Bearer ", dejar pasar
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer token y correo
        String token = header.substring(7);
        String correo = jwtService.extraerCorreo(token);

        // 4. Buscar usuario en BD
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElseThrow();

        // 5. Crear autenticación con el rol
        var autoridad = new SimpleGrantedAuthority("ROLE_" + usuario.getRol());
        var autenticacion = new UsernamePasswordAuthenticationToken(
                usuario.getCorreo(), null, List.of(autoridad));

        // 6. Guardar en SecurityContextHolder
        SecurityContextHolder.getContext().setAuthentication(autenticacion);

        // 7. Continuar con el filtro
        filterChain.doFilter(request, response);
    }
}
```

---

## 7. Autorización por roles

### Configuración en SecurityConfig.java

```java
.authorizeHttpRequests(auth -> auth
    // PÚBLICOS (sin token)
    .requestMatchers(HttpMethod.POST, "/api/auth/login", "/registro").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/servicios", "/servicios").permitAll()

    // Solo ADMIN: usuarios (ver, editar, eliminar)
    .requestMatchers(HttpMethod.GET, "/api/usuarios/**", "/usuarios/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/usuarios/**", "/usuarios/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**", "/usuarios/**").hasRole("ADMIN")

    // Solo ADMIN: gestión del negocio (servicios y cualquier borrado)
    .requestMatchers(HttpMethod.DELETE, "/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/servicios", "/servicios").hasRole("ADMIN")
    .requestMatchers(HttpMethod.PUT, "/api/servicios/**", "/servicios/**").hasRole("ADMIN")

    // CLIENTE o ADMIN
    .requestMatchers(HttpMethod.POST, "/api/mascotas", "/mascotas").hasAnyRole("CLIENTE", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/reservas", "/reservas").hasAnyRole("CLIENTE", "ADMIN")
    .requestMatchers(HttpMethod.PATCH, "/api/reservas/**", "/reservas/**").hasAnyRole("CLIENTE", "ADMIN")

    // Cualquier otro: autenticado
    .anyRequest().authenticated()
)
```

### Tabla de permisos

| Endpoint | ADMIN | CLIENTE | Sin auth |
|----------|-------|---------|----------|
| POST /registro | ✅ | ✅ | ✅ |
| POST /api/auth/login | ✅ | ✅ | ✅ |
| GET /api/servicios | ✅ | ✅ | ✅ |
| GET /api/usuarios | ✅ | ❌ | ❌ |
| GET /api/usuarios/{id} | ✅ | ❌ | ❌ |
| PUT /api/usuarios/{id} | ✅ | ❌ | ❌ |
| DELETE /api/usuarios/{id} | ✅ | ❌ | ❌ |
| POST /api/servicios | ✅ | ❌ | ❌ |
| PUT /api/servicios/{id} | ✅ | ❌ | ❌ |
| DELETE /api/servicios/{id} | ✅ | ❌ | ❌ |
| POST /api/mascotas | ✅ | ✅* | ❌ |
| PUT /api/mascotas/{id} | ✅ | ✅* | ❌ |
| DELETE /api/mascotas/{id} | ✅ | ❌ | ❌ |
| POST /api/reservas | ✅ | ✅* | ❌ |
| PUT /api/reservas/{id} | ✅ | ✅* | ❌ |
| PATCH /api/reservas/{id}/estado | ✅ | ✅* | ❌ |
| DELETE /api/reservas/{id} | ✅ | ❌ | ❌ |
| GET /api/mascotas | ✅ | ✅* | ❌ |
| GET /api/reservas | ✅ | ✅* | ❌ |

*El CLIENTE **solo puede operar sobre sus propios datos** (validado en el Service mediante el correo del token en el `SecurityContext`; si intenta acceder a datos de otro usuario recibe **403**). El ADMIN siempre tiene acceso total.

> **Nota (corregido en esta sesión):** además de las reglas por URL del `SecurityConfig`, `MascotaService` y `ReservaService` validan la **propiedad** del recurso:
> - `verificarAccesoMascota(mascota)` y `verificarAccesoReserva(reserva)`: permiten la operación si el rol es ADMIN o si el dueño del recurso es el usuario autenticado.
> - Las listas `GET /api/mascotas` y `GET /api/reservas` se filtran automáticamente: un CLIENTE solo ve sus propios datos.
> - Al **crear** reservas, un CLIENTE no puede usar una mascota de otro usuario (`No tienes permiso para reservar con esta mascota.`).

---

## 8. Endpoints disponibles

### Autenticación

| Método | Endpoint | Descripción | Acceso | Body |
|--------|----------|-------------|--------|------|
| POST | `/registro` | Registrar usuario | Público | `{ nombre, correo, contrasena }` |
| POST | `/api/auth/login` | Iniciar sesión | Público | `{ correo, contrasena }` |

**Respuesta de login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "usuarioId": 1,
  "nombre": "Carlos Pérez",
  "correo": "carlos.perez@email.com",
  "rol": "CLIENTE"
}
```

### Usuarios

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/usuarios` | Listar todos | ADMIN |
| GET | `/api/usuarios/{id}` | Obtener por ID | ADMIN |
| PUT | `/api/usuarios/{id}` | Actualizar | ADMIN |
| DELETE | `/api/usuarios/{id}` | Eliminar | ADMIN |

### Mascotas

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

### Reservas

| Método | Endpoint | Descripción | Acceso | Filtros |
|--------|----------|-------------|--------|---------|
| GET | `/api/reservas` | Listar | Autenticado | `?correo=` o `?usuarioId=` |
| GET | `/api/reservas/{id}` | Obtener por ID | Autenticado | - |
| POST | `/api/reservas` | Crear | CLIENTE/ADMIN | - |
| PUT | `/api/reservas/{id}` | Actualizar | Autenticado | - |
| PATCH | `/api/reservas/{id}/estado` | Cambiar estado | CLIENTE/ADMIN | `{ "estado": "CONFIRMADA" }` |
| DELETE | `/api/reservas/{id}` | Eliminar | Autenticado | - |

---

## 9. Flujo de una petición HTTP

### Ejemplo: Crear una reserva

```
CLIENTE                          SERVIDOR
  │                                │
  │  POST /api/reservas            │
  │  Authorization: Bearer <token> │
  │  { fecha, hora, servicioIds }  │
  │  ─────────────────────────────>│
  │                                │
  │                     ┌──────────┴──────────┐
  │                     │ JwtAuthenticationFilter │
  │                     │  1. Lee header       │
  │                     │  2. Valida token     │
  │                     │  3. Busca usuario    │
  │                     │  4. Setea auth       │
  │                     └──────────┬──────────┘
  │                                │
  │                     ┌──────────┴──────────┐
  │                     │ SecurityConfig       │
  │                     │  Verifica: CLIENTE   │
  │                     │  puede POST /reservas │
  │                     └──────────┬──────────┘
  │                                │
  │                     ┌──────────┴──────────┐
  │                     │ ReservaController    │
  │                     │  Recibe DTO          │
  │                     └──────────┬──────────┘
  │                                │
  │                     ┌──────────┴──────────┐
  │                     │ ReservaService       │
  │                     │  Valida datos        │
  │                     │  Busca mascota       │
  │                     │  Busca servicios     │
  │                     │  Guarda reserva      │
  │                     └──────────┬──────────┘
  │                                │
  │                     ┌──────────┴──────────┐
  │                     │ ReservaRepository    │
  │                     │  INSERT INTO reservas│
  │                     └──────────┬──────────┘
  │                                │
  │  201 Created                   │
  │  { reservaId, fecha, estado }  │
  │  <─────────────────────────────│
```

---

## 10. Cómo ejecutar el proyecto

### Requisitos previos

- **Java 17** instalado
- Conexión a internet (para conectar con Neon)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/Backend_AgendaPets.git
cd Backend_AgendaPets

# 2. Ejecutar (Windows)
mvnw.cmd spring-boot:run

# 2. Ejecutar (Linux/Mac)
./mvnw spring-boot:run

# 3. La aplicación estará en
http://localhost:8080
```

### Variables de entorno (opcional)

```powershell
# Windows PowerShell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://..."
$env:SPRING_DATASOURCE_USERNAME="..."
$env:SPRING_DATASOURCE_PASSWORD="..."
$env:JWT_SECRET="tu-clave-secreta-de-al-menos-32-caracteres"
```

---

## 11. Datos de prueba

### Cómo funciona `DataInitializer` (corregido en esta sesión)

Al iniciar la aplicación, `DataInitializer` **verifica qué datos faltan y solo crea los que no existen**. Antes usaba `usuarioRepository.count() > 0` y no sembraba **nada** si la tabla ya tenía datos; eso causó que en bases pobladas los usuarios de prueba nunca se crearan y, al insertarlos a mano en texto plano, el login fallara.

La verificación es **idempotente** (se ejecuta en cada arranque sin duplicar registros):

| Recurso | Clave de verificación |
|---------|-----------------------|
| **Usuarios** | `findByCorreo(correo)` |
| **Servicios** | `findByNombreContainingIgnoreCase(nombre)` |
| **Mascotas** | nombre + correo del dueño |
| **Reservas** | mascota + fecha + hora |

**Corrección de contraseñas:** si un usuario ya existe pero su `contrasena` **no tiene formato BCrypt** (`^$2[aby]\$\d{2}\$...`, es decir, está en texto plano), la **re-hashea automáticamente** con `BCryptPasswordEncoder` y registra una advertencia en el log. Así el login vuelve a funcionar sin intervención manual.

Datos que se asegura que existan en cada arranque:

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

## 12. Pruebas con Postman/curl

### 12.1 Registrar usuario

```bash
curl -X POST http://localhost:8080/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan López",
    "correo": "juan@email.com",
    "contrasena": "123456"
  }'
```

**Respuesta esperada (201 Created):**
```json
{
  "usuarioId": 5,
  "nombre": "Juan López",
  "correo": "juan@email.com",
  "email": "juan@email.com",
  "estado": true,
  "rol": "cliente"
}
```

### 12.2 Iniciar sesión

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "carlos.perez@email.com",
    "contrasena": "cliente123"
  }'
```

**Respuesta esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjYXJsb3MucGVyZXpAZW1haWwuY29tIiwicm9sIjoiQ0xJRU5URSIsImlhdCI6MTcyNTAwMDAwMCwiZXhwIjoxNzI1MDI4ODAwfQ...",
  "tipo": "Bearer",
  "usuarioId": 2,
  "nombre": "Carlos Pérez",
  "correo": "carlos.perez@email.com",
  "rol": "CLIENTE"
}
```

### 12.3 Usar token en endpoints protegidos

```bash
# Reemplazar <TOKEN> con el token obtenido en el login
curl http://localhost:8080/api/mascotas \
  -H "Authorization: Bearer <TOKEN>"
```

### 12.4 Crear mascota

```bash
curl -X POST http://localhost:8080/api/mascotas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "nombre": "Rocky",
    "raza": "Labrador",
    "tipo": "Perro",
    "tamano": "Grande",
    "notas": "Muy juguetón",
    "correoDueno": "carlos.perez@email.com"
  }'
```

### 12.5 Crear reserva

```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "fecha": "2026-09-15",
    "horaString": "10:00",
    "servicioIds": [1, 2],
    "correoDueno": "carlos.perez@email.com",
    "nombreMascota": "Rocky"
  }'
```

### 12.6 Cambiar estado de reserva

```bash
curl -X PATCH http://localhost:8080/api/reservas/1/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{ "estado": "CONFIRMADA" }'
```

---

### 12.7 Pruebas de verificación del JWT (realizadas en esta sesión)

Batería para confirmar que la autenticación JWT funciona de punta a punta:

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 1 | `POST /api/auth/login` con credenciales correctas | **200** + `token`, `tipo: Bearer`, `usuarioId`, `rol` |
| 2 | Login con contraseña incorrecta | **401** `Usuario o contraseña incorrectos` |
| 3 | Login de usuario inactivo (`ana.martinez@email.com`) | **401** `Esta cuenta se encuentra inactiva.` |
| 4 | `GET /api/mascotas` **sin** header `Authorization` | **401** `Token invalido, ausente o expirado` |
| 5 | `GET /api/mascotas` con token inválido/corrupto | **401** |
| 6 | `GET /api/mascotas` con token válido de CLIENTE | **200** |
| 7 | Token con firma hecha con otra clave (editar payload en jwt.io) | **401** (el payload NO es de confianza, solo la firma) |
| 8 | Decodificar el token en [jwt.io](https://jwt.io) | `sub` = correo, `rol`, `iat`, `exp` = +8 horas |

> **Problema detectado y corregido:** todos los logins daban `401 Usuario o contraseña incorrectos` incluso con contraseñas correctas porque los usuarios sembrados directamente en Neon tenían la contraseña en **texto plano** (`admin123`, `cliente123`, etc.). BCrypt no puede comparar contra texto plano, así que `matches()` siempre daba `false`. Se re-hashearon esas filas a BCrypt en la base de datos y, con la corrección de `DataInitializer` (sección 11), el problema queda solucionado de forma automática en el futuro.

### 12.8 Pruebas de permisos por rol (estado final de esta sesión)

Con tokens de ADMIN y CLIENTE se comprobó la autorización:

| Prueba con token **CLIENTE** | Resultado |
|---|---|
| `POST /api/servicios` / `PUT` / `DELETE` sobre servicios | **403** |
| `GET /api/usuarios`, `GET/PUT/DELETE /api/usuarios/{id}` | **403** |
| `GET /api/mascotas?correo=otro@email.com` o ver/reservar mascotas ajenas | **403** |
| `GET /api/reservas/3`, `PUT`, `PATCH`, `DELETE` de una reserva ajena | **403** |
| `POST /registro` con `"rol":"ADMIN"` en el body | **201**, pero el usuario se crea con rol **`cliente`** (sin escalada) |
| `POST /registro` con `"rol":"INVALIDO"` en el body | **400**, error `Rol inválido: INVALIDO. Roles válidos: ADMIN, CLIENTE` (validación del enum) |
| `POST /api/mascotas` y `POST /api/reservas` (propias) | **201** |
| `PUT` y `PATCH` sobre sus **propias** reservas (incluye cambiar los servicios) | **200** |
| `GET /api/mascotas` y `GET /api/reservas` | **200**, solo sus datos |

| Prueba con token **ADMIN** | Resultado |
|---|---|
| `GET /api/usuarios` (listar todos), ver/editar usuario por id | **200** |
| `POST /api/servicios`, `DELETE /api/servicios/{id}` | **201** / **200** |
| Ver o editar cualquier mascota o reserva (incluida la ajena) | **200** |

---

## 13. Errores comunes y soluciones

### Errores de autenticación

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Token invalido, ausente o expirado` | No se envió header o token expiró | Hacer login de nuevo para obtener token nuevo |
| `403 No tienes permiso para realizar esta accion` | El rol del token no tiene acceso | Verificar el rol del usuario |
| `400 Rol inválido: X. Roles válidos: ADMIN, CLIENTE` | Se envió un valor de rol que no existe en el enum `Rol` | Usar solo `ADMIN` o `CLIENTE` en el campo `rol` |
| `401 Usuario o contraseña incorrectos` | Credenciales erróneas | Verificar correo y contraseña |
| `401 Usuario o contraseña incorrectos` (con credenciales correctas) | La contraseña en la BD está en **texto plano** en vez de hash BCrypt | Reiniciar la app: `DataInitializer` la re-hashea automáticamente. Evitar insertar usuarios a mano; usar siempre `POST /registro` |

### Errores de compilación

| Error | Causa | Solución |
|-------|-------|----------|
| `incompatible types: String cannot be converted to TipoMascota` | Se pasó String en vez de enum | Usar `TipoMascota.valueOf("Perro")` o el enum directo |
| `Cannot resolve symbol` | Falta import o dependencia | Agregar import o dependencia en pom.xml |

### Errores de base de datos

| Error | Causa | Solución |
|-------|-------|----------|
| `Connection refused` | Neon no está accesible | Verificar URL de conexión y que la BD esté activa |
| `Table already exists` | La tabla ya existe en la BD | Normal con `ddl-auto=update`, no afecta |
| `JWT signature invalid` | Secret key incorrecta | Verificar que `jwt.secret` tenga al menos 32 caracteres |

---

## 14. Glosario de términos

| Término | Significado |
|---------|-------------|
| **API** | Application Programming Interface. Conjunto de endpoints HTTP para comunicar frontend y backend |
| **REST** | Arquitectura para APIs que usa verbos HTTP (GET, POST, PUT, DELETE) |
| **Endpoint** | URL específica que responde a un método HTTP (ej: GET /api/mascotas) |
| **DTO** | Data Transfer Object. Objeto que se envía/recibe en los endpoints |
| **Entity** | Clase Java que representa una tabla de la base de datos |
| **Repository** | Interface que Spring Data usa para generar consultas SQL automáticamente |
| **Service** | Clase que contiene la lógica de negocio |
| **Controller** | Clase que recibe peticiones HTTP y retorna respuestas |
| **JWT** | JSON Web Token. Token de autenticación que viaja en el header Authorization |
| **BCrypt** | Algoritmo para hashear contraseñas (nunca se guardan en texto plano) |
| **CORS** | Cross-Origin Resource Sharing. Permite que el frontend se comunique con el backend |
| **RBAC** | Role-Based Access Control. Control de acceso basado en roles |
| **JPA** | Java Persistence API. Estándar para mapear objetos a tablas |
| **Hibernate** | Implementación de JPA que genera el SQL automáticamente |
| **Maven** | Build tool para gestionar dependencias y compilar |
| **Lombok** | Librería que genera getters, setters, constructores automáticamente |
| **Enum** | Tipo de dato que solo puede tener valores predefinidos (ej: Perro, Gato) |
| **Seed data** | Datos de prueba que se crean automáticamente al iniciar la app |
| **OncePerRequestFilter** | Filtro que se ejecuta una vez por cada petición HTTP |

---

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend/App)                    │
│                                                                 │
│  1. POST /api/auth/login  ─────────────────────────────────────>│
│     { correo, contrasena }                                      │
│                                                                 │
│  2. Recibe: { token, usuarioId, rol }                           │
│                                                                 │
│  3. GET /api/mascotas                                           │
│     Authorization: Bearer <token>  ────────────────────────────>│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SPRING SECURITY                              │
│                                                                 │
│  JwtAuthenticationFilter:                                       │
│    - Lee header "Authorization: Bearer <token>"                 │
│    - Valida firma y expiración                                  │
│    - Extrae correo del token                                    │
│    - Busca usuario en BD                                        │
│    - Setea autenticación con rol                                │
│                                                                 │
│  SecurityConfig:                                                │
│    - Verifica si el endpoint es público o requiere auth         │
│    - Verifica si el rol tiene permiso                           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER                                  │
│  MascotaController.listarTodas()                                │
│    - Recibe la petición                                         │
│    - Llama al Service                                           │
│    - Retorna ResponseEntity con DTO                             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE                                    │
│  MascotaService.listarTodas()                                   │
│    - Lógica de negocio                                          │
│    - Conversión Entity ↔ DTO                                    │
│    - Validaciones                                               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REPOSITORY                                  │
│  MascotaRepository.findAll()                                    │
│    - Spring genera: SELECT * FROM mascotas                      │
│    - Retorna List<Mascota>                                      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (Neon PostgreSQL)                │
│                                                                 │
│  tablas: usuarios, mascotas, servicios, reservas,               │
│          reserva_servicios                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Auditoría completa (57 pruebas)

Se ejecutó una batería de 57 pruebas HTTP contra el backend corriendo en puerto 8081, verificando autenticación, autorización, validación de datos, ownership y manejo de errores. También se verificó la integridad de los datos en Neon PostgreSQL.

### Resultado general

| Batería | Pruebas | PASS | FAIL | Descripción |
|---------|---------|------|------|-------------|
| 1. Auth | 6 | 6 | 0 | Login, credenciales, usuario inactivo |
| 2. Registro | 8 | 7 | 1 | Validación, enum, duplicados, aliases |
| 3. Usuarios | 8 | 8 | 0 | CRUD con roles ADMIN/CLIENTE |
| 4. Mascotas | 10 | 10 | 0 | CRUD con ownership |
| 5. Servicios | 8 | 8 | 0 | CRUD con permisos por rol |
| 6. Reservas | 10 | 10 | 0 | CRUD con ownership y estados |
| 7. Edge Cases | 7 | 6 | 1 | Tokens, JSON malformado, rutas |
| **TOTAL** | **57** | **55** | **2** | **96.5% pass rate** |
| Neon | 4 | 4 | 0 | Integridad de datos |

### Detalle de pruebas

#### Batería 1: Auth (6/6 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T1 | Login admin (`admin@agendapets.com`) | 200 + token | 200 PASS |
| T2 | Login cliente (`carlos.perez@email.com`) | 200 + token | 200 PASS |
| T3 | Login sin campo `correo` | 400 | 400 PASS |
| T4 | Login sin campo `contrasena` | 400 | 400 PASS |
| T5 | Login contraseña incorrecta | 401 | 401 PASS |
| T6 | Login usuario inactivo (`ana.martinez@email.com`) | 401 | 401 PASS |

#### Batería 2: Registro (7/8 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T7 | Registro válido con `correo`/`contrasena` | 201 | 201 PASS |
| T8 | Registro `"rol":"INVALIDO"` | 400 | 400 PASS |
| T9 | Registro `"rol":"ADMIN"` → crea CLIENTE | 201, rol=cliente | 201 PASS |
| T10 | Registro correo duplicado | 400 | 400 PASS |
| T11 | Registro sin `correo` | 400 | 400 PASS |
| T12 | Registro sin `contrasena` | 400 | 400 PASS |
| T13 | Registro `contrasena` con 3 caracteres | 400 | 400 PASS |
| T14 | Registro con alias `email`/`password` | 201 | **400 FAIL** |

> **T14 - Bug conocido:** El frontend NO puede enviar `email`/`password` como alias en registro. Debe usar `correo`/`contrasena`. Ver §16 para la corrección pendiente.

#### Batería 3: Usuarios CRUD (8/8 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T15 | ADMIN lista todos los usuarios | 200 | 200 PASS |
| T16 | CLIENTE intenta listar usuarios | 403 | 403 PASS |
| T17 | ADMIN obtiene usuario por ID | 200 | 200 PASS |
| T18 | ADMIN obtiene usuario inexistente (ID 999) | 404 | 404 PASS |
| T19 | ADMIN actualiza nombre de usuario | 200 | 200 PASS |
| T20 | ADMIN envía `"rol":"SUPERADMIN"` en update | 400 | 400 PASS |
| T21 | CLIENTE intenta obtener usuario por ID | 403 | 403 PASS |
| T22 | ADMIN elimina usuario de prueba | 200 | 200 PASS |

#### Batería 4: Mascotas CRUD (10/10 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T23 | ADMIN crea mascota | 201 | 201 PASS |
| T24 | CLIENTE crea mascota propia | 201 | 201 PASS |
| T25 | CLIENTE crea mascota sin `nombre` | 400 | 400 PASS |
| T26 | CLIENTE crea mascota para otro usuario | 403 | 403 PASS |
| T27 | CLIENTE lista sus mascotas | 200 | 200 PASS |
| T28 | CLIENTE intenta listar mascotas de otro | 403 | 403 PASS |
| T29 | CLIENTE actualiza mascota propia | 200 | 200 PASS |
| T30 | CLIENTE actualiza mascota de Laura | 403 | 403 PASS |
| T31 | CLIENTE intenta eliminar mascota | 403 | 403 PASS |
| T32 | ADMIN elimina mascota de prueba | 200 | 200 PASS |

#### Batería 5: Servicios CRUD (8/8 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T33 | Público lista servicios (sin auth) | 200 | 200 PASS |
| T34 | Sin token obtiene servicio por ID | 401 | 401 PASS |
| T35 | ADMIN crea servicio | 201 | 201 PASS |
| T36 | CLIENTE intenta crear servicio | 403 | 403 PASS |
| T37 | ADMIN crea servicio sin `nombre` | 400 | 400 PASS |
| T38 | ADMIN crea servicio con precio negativo | 400 | 400 PASS |
| T39 | ADMIN actualiza servicio | 200 | 200 PASS |
| T40 | ADMIN elimina servicio | 200 | 200 PASS |

#### Batería 6: Reservas CRUD (10/10 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T41 | CLIENTE crea reserva propia | 201 | 201 PASS |
| T42 | CLIENTE crea reserva con `servicioIds` | 201 | 201 PASS |
| T43 | CLIENTE crea reserva con mascota ajena | 403 | 403 PASS |
| T44 | CLIENTE lista sus reservas | 200 | 200 PASS |
| T45 | CLIENTE intenta listar reservas de otro | 403 | 403 PASS |
| T46 | CLIENTE actualiza fecha de reserva propia | 200 | 200 PASS |
| T47 | CLIENTE actualiza reserva de Laura | 403 | 403 PASS |
| T48 | PATCH cambia estado a CONFIRMADA | 200 | 200 PASS |
| T49 | CLIENTE cambia estado de reserva ajena | 403 | 403 PASS |
| T50 | ADMIN elimina reserva | 200 | 200 PASS |

#### Batería 7: Edge Cases (6/7 PASS)

| # | Prueba | Esperado | Resultado |
|---|--------|----------|-----------|
| T51 | Token JWT inválido/falso | 401 | 401 PASS |
| T52 | Header `Authorization` sin prefijo `Bearer` | 401 | 401 PASS |
| T53 | `GET /api/servicios/1` sin token | 401 | 401 PASS |
| T54 | `POST /api/mascotas` con body `{}` vacío | 400 | 400 PASS |
| T55 | `POST /api/auth/login` con JSON malformado | 400 | **401 FAIL** |
| T56 | `GET /api/noexiste` (ruta inexistente) | 401 | 401 PASS |
| T57 | `DELETE /api/mascotas/1` sin token | 401 | 401 PASS |

> **T55 - Bug conocido:** JSON malformado en login devuelve 401 en vez de 400. Spring Security intercepta antes del controller. Ver §16 para la corrección pendiente.

### Verificación Neon PostgreSQL

| Verificación | Query | Resultado |
|---|---|---|
| N1: Contraseñas hasheadas | `SELECT substring(contrasena, 1, 3), length(contrasena) FROM usuarios` | 15/15 con `$2a$`/`$2b$`, 60 chars PASS |
| N2: Usuarios test | `SELECT * FROM usuarios WHERE correo LIKE '%@test.com'` | 6 usuarios, todos rol=CLIENTE PASS |
| N3: Mascotas con dueños | `SELECT m.*, u.correo FROM mascotas m JOIN usuarios u...` | 13 mascotas, dueños correctos PASS |
| N4: Reservas y estados | `SELECT r.*, m.nombre FROM reservas r JOIN mascotas m...` | 10 reservas, estados correctos PASS |

---

## 16. Correcciones pendientes para frontend

Estas son correcciones identificadas en la auditoría (§15) que deben implementarse antes de la integración con el frontend. No son críticas pero mejoran la experiencia del desarrollador frontend.

### Bug 1: Alias `email`/`password` no funcionan en registro

**Problema:** El frontend envía `email`/`password` pero recibe error 400 `"El correo es obligatorio"`.

**Causa:** `@Valid` en `UsuarioController.java:23` valida `correo`/`contrasena` antes de que el servicio pueda usar `getCorreoEfectivo()`/`getContrasenaEfectiva()`.

**Corrección:**

1. Quitar `@Valid` del controller (`UsuarioController.java:23`):
```java
// ANTES:
public ResponseEntity<?> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
// DESPUÉS:
public ResponseEntity<?> registrar(@RequestBody UsuarioRequestDTO dto) {
```

2. Agregar validación manual en `UsuarioService.java:registrar()` después de la línea 36:
```java
String contrasena = dto.getContrasenaEfectiva();
if (contrasena == null || contrasena.isBlank()) {
    throw new IllegalArgumentException("La contraseña es obligatoria.");
}
if (contrasena.length() < 6) {
    throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
}
```

**Resultado:** Ambos formatos funcionan:
- `{"correo":"x@test.com","contrasena":"123456"}` → 201
- `{"email":"x@test.com","password":"123456"}` → 201

---

### Bug 2: JSON malformado devuelve 401 en vez de 400

**Problema:** Si el frontend envía JSON corrupto (ej: `{"correo":"admin@agendapets.com","contrasena":}`), recibe 401 en vez de 400.

**Causa:** Spring Security intercepta antes del controller. El `AuthenticationEntryPoin` siempre retorna 401.

**Corrección:** Agregar handler en `GlobalExceptionHandler.java`:

```java
@ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
public ResponseEntity<Map<String, String>> manejarJsonMalformado(
        org.springframework.http.converter.HttpMessageNotReadableException ex) {
    Map<String, String> cuerpo = new HashMap<>();
    cuerpo.put("error", "El cuerpo de la petición no es JSON válido");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
}
```

**Nota:** Si Spring Security intercepta antes del controller (no lo atrapa `@ControllerAdvice`), se necesita un validador de content-type en el filtro JWT. Probar primero con esta solución.

---

### Bug 3: `GET /api/servicios/{id}` requiere auth

**Problema:** El frontend puede listar servicios sin token (`GET /api/servicios`), pero para ver un servicio individual necesita token (`GET /api/servicios/1`).

**Causa:** La regla `permitAll` en `SecurityConfig.java:45` solo matchea rutas exactas, no wildcards.

**Corrección:** Modificar `SecurityConfig.java:45`:

```java
// ANTES:
.requestMatchers(HttpMethod.GET, "/api/servicios", "/servicios").permitAll()
// DESPUÉS:
.requestMatchers(HttpMethod.GET, "/api/servicios", "/servicios",
                 "/api/servicios/**", "/servicios/**").permitAll()
```

**Resultado:** Ver un servicio individual no requiere token (igual que listar todos).

---

### Resumen de cambios pendientes

| # | Archivo | Línea | Cambio | Riesgo |
|---|---------|-------|--------|--------|
| 1 | `UsuarioController.java` | 23 | Quitar `@Valid` | Bajo |
| 2 | `UsuarioService.java` | ~37 | Agregar validación manual de contraseña | Bajo |
| 3 | `GlobalExceptionHandler.java` | Nueva | Handler `HttpMessageNotReadableException` | Bajo |
| 4 | `SecurityConfig.java` | 45 | Agregar wildcards GET servicios | Bajo |

> **Nota:** Estos cambios no rompen funcionalidad existente. Solo mejoran la experiencia del frontend. Se recomienda implementarlos antes de iniciar la integración con el frontend.

---

## 17. Roadmap - Escalabilidad a Futuro

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

- [x] Integración con frontend AgendaPets (Vercel)
- [ ] Panel administrativo completo
- [ ] Dashboard con estadísticas del negocio

### Fase 4: Infraestructura

- [x] Docker (multi-stage build)
- [x] Deploy en Render (backend)
- [x] Deploy en Vercel (frontend)
- [ ] CI/CD con GitHub Actions
- [ ] Tests unitarios y de integración
- [ ] Monitorización y logging estructurado

### Fase 5: Expansión

- [ ] App móvil con Flutter / React Native
- [ ] Sistema de pagos integrado
- [ ] Múltiples sucursales
- [ ] API pública para terceros

---

*Documento generado para el proyecto AgendaPets Backend - Guía para desarrolladores.*
