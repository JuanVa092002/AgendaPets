CREATE TABLE usuarios (
usuario_id SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
correo VARCHAR(150) UNIQUE NOT NULL,
contrasena VARCHAR(150) NOT NULL,
estado BOOLEAN DEFAULT true,
rol VARCHAR(20) NOT NULL
);

CREATE TABLE servicios (
servicio_id SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
descripcion TEXT,
precio DECIMAL(10, 2) NOT NULL,
duracion_servicio INT NOT NULL 
);

CREATE TABLE mascotas (
id_mascota SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
raza VARCHAR(100),
tipo VARCHAR(50) NOT NULL,
notas TEXT,
tamano VARCHAR(50) NOT NULL, 
usuario_id INT NOT NULL,
CONSTRAINT fk_mascotas_usuario FOREIGN KEY (usuario_id) 
REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

CREATE TABLE reservas (
reserva_id SERIAL PRIMARY KEY,
fecha DATE NOT NULL,
hora TIME NOT NULL,
estado VARCHAR(50) DEFAULT 'PENDIENTE',
id_mascota INT NOT NULL,
CONSTRAINT fk_reservas_mascota FOREIGN KEY (id_mascota) 
REFERENCES mascotas(id_mascota) ON DELETE CASCADE
);


CREATE TABLE reserva_servicios (
id SERIAL PRIMARY KEY,
reserva_id INT NOT NULL,
servicio_id INT NOT NULL,
precio_total DECIMAL(10, 2),
CONSTRAINT fk_detalle_reserva FOREIGN KEY (reserva_id) 
REFERENCES reservas(reserva_id) ON DELETE CASCADE,
CONSTRAINT fk_detalle_servicio FOREIGN KEY (servicio_id) 
REFERENCES servicios(servicio_id) ON DELETE CASCADE
);

-- Aquí estamos generando una tabla que relaciona a todas las mascotas con su respectivo dueño

SELECT 
m.id_mascota, 
m.nombre AS nombre_mascota, 
m.raza, 
u.nombre AS nombre_dueno, 
u.correo
FROM mascotas m
INNER JOIN usuarios u ON m.usuario_id = u.usuario_id;

-- Aquí visualizamos la agenda completa de reservas, anidando los datos de dueño, mascota, fecha, hora y estado

SELECT 
r.reserva_id,
r.fecha,
r.hora,
r.estado,
m.nombre AS mascota,
u.nombre AS cliente
FROM reservas r
INNER JOIN mascotas m ON r.id_mascota = m.id_mascota
INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
ORDER BY r.fecha ASC, r.hora ASC;
