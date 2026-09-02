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

-- Aquí agregamos los datos.

INSERT INTO usuarios (nombre, correo, contrasena, estado, rol) VALUES
('Peluquería Canina Admin', 'admin@agendapets.com', 'admin123', true, 'ADMIN'),
('Carlos Pérez', 'carlos.perez@email.com', 'cliente123', true, 'CLIENTE'),
('Laura Gómez', 'laura.gomez@email.com', 'cliente123', true, 'CLIENTE'),
('Ana Martínez', 'ana.martinez@email.com', 'cliente123', false, 'CLIENTE');

INSERT INTO servicios (nombre, descripcion, precio, duracion_servicio) VALUES
('Baño Básico', 'Incluye baño con champú especial, secado y cepillado', 35000.00, 45),
('Corte de Pelo', 'Corte de pelo según raza o preferencia del dueño', 45000.00, 60),
('Corte de Uñas', 'Corte y limado de uñas con cuidado higiénico', 15000.00, 15),
('Limpieza de Oídos', 'Limpieza profunda de canales auditivos', 12000.00, 15),
('Servicio Completo Spa', 'Baño, corte, uñas, oídos y perfume', 85000.00, 90);

INSERT INTO mascotas (nombre, raza, tipo, notas, tamano, usuario_id) VALUES
('Firulais', 'Golden Retriever', 'Perro', 'Es muy amigable pero le tiene miedo al secador', 'Grande', 2),
('Milo', 'Poodle', 'Perro', 'Piel sensible, usar champú hipoalergénico', 'Pequeno', 2),
('Luna', 'Siamés', 'Gato', 'Suele ponerse nerviosa en el baño', 'Pequeno', 3),
('Max', 'Bulldog Francés', 'Perro', 'Requiere cuidado especial en las arrugas de la cara', 'Mediano', 4);

INSERT INTO reservas (fecha, hora, estado, id_mascota) VALUES
('2026-09-10', '09:00:00', 'PENDIENTE', 1),
('2026-09-10', '10:30:00', 'CONFIRMADA', 2),
('2026-09-11', '14:00:00', 'COMPLETADA', 3),
('2026-09-12', '11:00:00', 'CANCELADA', 4);

INSERT INTO reserva_servicios (reserva_id, servicio_id, precio_total) VALUES
(1, 1, 35000.00),
(1, 3, 15000.00),
(2, 2, 45000.00),
(3, 5, 85000.00),
(4, 1, 35000.00),
(4, 4, 12000.00);



-- CONSULTAS:

-- Aquí estamos generando una tabla que relaciona a todas las mascotas con su respectivo dueño:

SELECT 
m.id_mascota, 
m.nombre AS nombre_mascota, 
m.raza, 
u.nombre AS nombre_dueno, 
u.correo
FROM mascotas m
INNER JOIN usuarios u ON m.usuario_id = u.usuario_id;

-- Aquí visualizamos la agenda completa de reservas, anidando los datos de dueño, mascota, fecha, hora y estado:

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

-- Aquí desglosamos los servicios y el total a pagar por cada servicio:

SELECT 
r.reserva_id,
m.nombre AS mascota,
s.nombre AS servicio,
rs.precio_total
FROM reserva_servicios rs
INNER JOIN reservas r ON rs.reserva_id = r.reserva_id
INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
INNER JOIN mascotas m ON r.id_mascota = m.id_mascota
ORDER BY r.fecha ASC, r.hora ASC;
