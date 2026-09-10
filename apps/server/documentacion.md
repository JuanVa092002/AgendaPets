# Documentación Completa - AgendaPets Backend

> **Guía para desarrolladores junior** - Explicación detallada de cada componente del proyecto.

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
| **ADMIN** | Ver todos los usuarios, eliminar usuarios, crear/editar/eliminar servicios, ver todas las reservas |
| **CLIENTE** | Crear mascotas, crear reservas, ver sus propias reservas |

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
| rol | VARCHAR(20) | "ADMIN" o "CLIENTE" |

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

    // Solo ADMIN
    .requestMatchers(HttpMethod.DELETE, "/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/servicios", "/servicios").hasRole("ADMIN")
    .requestMatchers(HttpMethod.GET, "/api/usuarios", "/usuarios").hasRole("ADMIN")

    // CLIENTE o ADMIN
    .requestMatchers(HttpMethod.POST, "/api/mascotas", "/mascotas").hasAnyRole("CLIENTE", "ADMIN")
    .requestMatchers(HttpMethod.POST, "/api/reservas", "/reservas").hasAnyRole("CLIENTE", "ADMIN")

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
| DELETE /api/usuarios/** | ✅ | ❌ | ❌ |
| POST /api/servicios | ✅ | ❌ | ❌ |
| POST /api/mascotas | ✅ | ✅ | ❌ |
| POST /api/reservas | ✅ | ✅ | ❌ |
| GET /api/mascotas | ✅ | ✅* | ❌ |
| GET /api/reservas | ✅ | ✅* | ❌ |

*Los CLIENTE solo ven sus propios datos (filtrado en el Service)

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

Al iniciar la aplicación, se crean automáticamente:

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

## 13. Errores comunes y soluciones

### Errores de autenticación

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Token invalido, ausente o expirado` | No se envió header o token expiró | Hacer login de nuevo para obtener token nuevo |
| `403 No tienes permiso para realizar esta accion` | El rol del token no tiene acceso | Verificar el rol del usuario |
| `401 Usuario o contraseña incorrectos` | Credenciales erróneas | Verificar correo y contraseña |

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

*Documento generado para el proyecto AgendaPets Backend - Guía para desarrolladores .*
