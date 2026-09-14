package com.agendapets.agendapets.config;

import com.agendapets.agendapets.model.Mascota;
import com.agendapets.agendapets.model.Reserva;
import com.agendapets.agendapets.model.Rol;
import com.agendapets.agendapets.model.Servicio;
import com.agendapets.agendapets.model.TamanoMascota;
import com.agendapets.agendapets.model.TipoMascota;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.MascotaRepository;
import com.agendapets.agendapets.repository.ReservaRepository;
import com.agendapets.agendapets.repository.ServicioRepository;
import com.agendapets.agendapets.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final Pattern HASH_BCRYPT = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    private static final String ADMIN_CORREO = "admin@agendapets.com";
    private static final String CARLOS_CORREO = "carlos.perez@email.com";
    private static final String LAURA_CORREO = "laura.gomez@email.com";
    private static final String ANA_CORREO = "ana.martinez@email.com";

    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;
    private final MascotaRepository mascotaRepository;
    private final ReservaRepository reservaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Verificando datos semilla...");

        Usuario admin = obtenerUsuarioSemilla("Peluquería Canina Admin", ADMIN_CORREO, "admin123", true, Rol.ADMIN);
        Usuario carlos = obtenerUsuarioSemilla("Carlos Pérez", CARLOS_CORREO, "cliente123", true, Rol.CLIENTE);
        Usuario laura = obtenerUsuarioSemilla("Laura Gómez", LAURA_CORREO, "cliente123", true, Rol.CLIENTE);
        Usuario ana = obtenerUsuarioSemilla("Ana Martínez", ANA_CORREO, "cliente123", false, Rol.CLIENTE);

        Servicio s1 = obtenerServicioSemilla("Baño Básico",
                "Incluye baño con champú especial, secado y cepillado",
                new BigDecimal("35000.00"), 45);
        Servicio s2 = obtenerServicioSemilla("Corte de Pelo",
                "Corte de pelo según raza o preferencia del dueño",
                new BigDecimal("45000.00"), 60);
        Servicio s3 = obtenerServicioSemilla("Corte de Uñas",
                "Corte y limado de uñas con cuidado higiénico",
                new BigDecimal("15000.00"), 15);
        Servicio s4 = obtenerServicioSemilla("Limpieza de Oídos",
                "Limpieza profunda de canales auditivos",
                new BigDecimal("12000.00"), 15);
        Servicio s5 = obtenerServicioSemilla("Servicio Completo Spa",
                "Baño, corte, uñas, oídos y perfume",
                new BigDecimal("85000.00"), 90);

        Mascota firulais = obtenerMascotaSemilla("Firulais", "Golden Retriever",
                TipoMascota.Perro, "Es muy amigable pero le tiene miedo al secador",
                TamanoMascota.Grande, carlos);
        Mascota milo = obtenerMascotaSemilla("Milo", "Poodle",
                TipoMascota.Perro, "Piel sensible, usar champú hipoalergénico",
                TamanoMascota.Pequeno, carlos);
        Mascota luna = obtenerMascotaSemilla("Luna", "Siamés",
                TipoMascota.Gato, "Suele ponerse nerviosa en el baño",
                TamanoMascota.Pequeno, laura);
        Mascota max = obtenerMascotaSemilla("Max", "Bulldog Francés",
                TipoMascota.Perro, "Requiere cuidado especial en las arrugas de la cara",
                TamanoMascota.Mediano, ana);

        crearReservaSemilla(LocalDate.parse("2026-09-10"), LocalTime.parse("09:00:00"), "PENDIENTE",
                firulais, List.of(s1, s3));
        crearReservaSemilla(LocalDate.parse("2026-09-10"), LocalTime.parse("10:30:00"), "CONFIRMADA",
                milo, List.of(s2));
        crearReservaSemilla(LocalDate.parse("2026-09-11"), LocalTime.parse("14:00:00"), "COMPLETADA",
                luna, List.of(s5));
        crearReservaSemilla(LocalDate.parse("2026-09-12"), LocalTime.parse("11:00:00"), "CANCELADA",
                max, List.of(s1, s4));

        log.info("Datos semilla verificados correctamente.");
    }

    private Usuario obtenerUsuarioSemilla(String nombre, String correo, String contrasena,
                                          boolean estado, Rol rol) {
        Optional<Usuario> existente = usuarioRepository.findByCorreo(correo);
        if (existente.isPresent()) {
            Usuario usuario = existente.get();
            if (!HASH_BCRYPT.matcher(usuario.getContrasena()).matches()) {
                usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
                usuarioRepository.save(usuario);
                log.warn("La contraseña de {} estaba en texto plano; se re-hasheó a BCrypt.", correo);
            }
            return usuario;
        }
        Usuario nuevo = usuarioRepository.save(Usuario.builder()
                .nombre(nombre)
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .estado(estado)
                .rol(rol)
                .build());
        log.info("Usuario semilla creado: {}", correo);
        return nuevo;
    }

    private Servicio obtenerServicioSemilla(String nombre, String descripcion, BigDecimal precio, int duracion) {
        return servicioRepository.findByNombreContainingIgnoreCase(nombre).stream().findFirst()
                .orElseGet(() -> {
                    Servicio servicio = servicioRepository.save(Servicio.builder()
                            .nombre(nombre)
                            .descripcion(descripcion)
                            .precio(precio)
                            .duracionServicio(duracion)
                            .build());
                    log.info("Servicio semilla creado: {}", nombre);
                    return servicio;
                });
    }

    private Mascota obtenerMascotaSemilla(String nombre, String raza, TipoMascota tipo, String notas,
                                          TamanoMascota tamano, Usuario usuario) {
        return mascotaRepository.findByUsuarioCorreoIgnoreCase(usuario.getCorreo()).stream()
                .filter(m -> m.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Mascota mascota = mascotaRepository.save(Mascota.builder()
                            .nombre(nombre)
                            .raza(raza)
                            .tipo(tipo)
                            .notas(notas)
                            .tamano(tamano)
                            .usuario(usuario)
                            .build());
                    log.info("Mascota semilla creada: {} (dueño {})", nombre, usuario.getCorreo());
                    return mascota;
                });
    }

    private void crearReservaSemilla(LocalDate fecha, LocalTime hora, String estado,
                                     Mascota mascota, List<Servicio> servicios) {
        boolean existe = reservaRepository.findByFecha(fecha).stream()
                .anyMatch(r -> r.getMascota().getIdMascota().equals(mascota.getIdMascota())
                        && r.getHora().equals(hora));
        if (existe) {
            return;
        }
        reservaRepository.save(Reserva.builder()
                .fecha(fecha)
                .hora(hora)
                .estado(estado)
                .mascota(mascota)
                .servicios(servicios)
                .build());
        log.info("Reserva semilla creada para la mascota {} el {}", mascota.getNombre(), fecha);
    }
}