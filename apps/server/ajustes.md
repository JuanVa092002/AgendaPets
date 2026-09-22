# Ajustes - Corrección precio_total en reservas

## Problema

Al crear una reserva, el campo `precio_total` se mostraba `NULL` en la base de datos (Neon). El cálculo existía en `mapToResponseDTO()` pero **nunca se persistía** en la tabla `reservas`.

## Causa

La entidad `Reserva` no tenía un campo `precioTotal` mapeado a una columna en la base de datos. Solo existía en el `ReservaResponseDTO` como valor calculado al vuelo.

## Solución

Se agregó el campo `precioTotal` a la entidad `Reserva` para que se persista al crear o actualizar una reserva.

## Archivos modificados

### 1. `src/main/java/com/agendapets/agendapets/model/Reserva.java`

Se agregó el campo `precioTotal`:

```java
@Column(name = "precio_total", precision = 10, scale = 2)
private BigDecimal precioTotal;
```

### 2. `src/main/java/com/agendapets/agendapets/service/ReservaService.java`

**En `crear()`** — Se calcula el total antes de guardar la reserva:

```java
BigDecimal precioTotal = servicios.stream()
        .map(s -> s.getPrecio() != null ? s.getPrecio() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

Reserva reserva = Reserva.builder()
        // ... otros campos
        .precioTotal(precioTotal)
        .build();
```

**En `actualizar()`** — Se recalcula el total cuando cambian los servicios:

```java
if (dto.getServicioIds() != null && !dto.getServicioIds().isEmpty()) {
    List<Servicio> nuevosServicios = servicioRepository.findAllById(dto.getServicioIds());
    reserva.setServicios(nuevosServicios);
    BigDecimal nuevoTotal = nuevosServicios.stream()
            .map(s -> s.getPrecio() != null ? s.getPrecio() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    reserva.setPrecioTotal(nuevoTotal);
}
```

## Acción manual en Neon

Si existe una columna `precio_total` en la tabla `reserva_servicios`, eliminarla:

```sql
ALTER TABLE reserva_servicios DROP COLUMN IF EXISTS precio_total;
```

La columna `precio_total` pertenece a la tabla `reservas`, no a la tabla intermedia `reserva_servicios`.

## Nota

La columna `precio_total` se creará automáticamente en la tabla `reservas` al iniciar la app gracias a `spring.jpa.hibernate.ddl-auto=update`.
