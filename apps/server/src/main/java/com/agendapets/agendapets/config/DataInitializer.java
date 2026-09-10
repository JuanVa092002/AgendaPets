package com.agendapets.agendapets.config;

import com.agendapets.agendapets.model.Mascota;
import com.agendapets.agendapets.model.Reserva;
import com.agendapets.agendapets.model.Servicio;
import com.agendapets.agendapets.model.TipoMascota;
import com.agendapets.agendapets.model.TamanoMascota;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;
    private final MascotaRepository mascotaRepository;
    private final ReservaRepository reservaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            log.info("La base de datos ya contiene información inicial. Omitiendo seed data.");
            return;
        }

        log.info("Inicializando datos de prueba de la Tarea 12 en la base de datos Neon...");

        // 1. Usuarios
        Usuario admin = usuarioRepository.save(Usuario.builder()
                .nombre("Peluquería Canina Admin")
                .correo("admin@agendapets.com")
                .contrasena(passwordEncoder.encode("admin123"))
                .estado(true)
                .rol("ADMIN")
                .build());

        Usuario carlos = usuarioRepository.save(Usuario.builder()
                .nombre("Carlos Pérez")
                .correo("carlos.perez@email.com")
                .contrasena(passwordEncoder.encode("cliente123"))
                .estado(true)
                .rol("CLIENTE")
                .build());

        Usuario laura = usuarioRepository.save(Usuario.builder()
                .nombre("Laura Gómez")
                .correo("laura.gomez@email.com")
                .contrasena(passwordEncoder.encode("cliente123"))
                .estado(true)
                .rol("CLIENTE")
                .build());

        Usuario ana = usuarioRepository.save(Usuario.builder()
                .nombre("Ana Martínez")
                .correo("ana.martinez@email.com")
                .contrasena(passwordEncoder.encode("cliente123"))
                .estado(false)
                .rol("CLIENTE")
                .build());

        // 2. Servicios
        Servicio s1 = servicioRepository.save(Servicio.builder()
                .nombre("Baño Básico")
                .descripcion("Incluye baño con champú especial, secado y cepillado")
                .precio(new BigDecimal("35000.00"))
                .duracionServicio(45)
                .build());

        Servicio s2 = servicioRepository.save(Servicio.builder()
                .nombre("Corte de Pelo")
                .descripcion("Corte de pelo según raza o preferencia del dueño")
                .precio(new BigDecimal("45000.00"))
                .duracionServicio(60)
                .build());

        Servicio s3 = servicioRepository.save(Servicio.builder()
                .nombre("Corte de Uñas")
                .descripcion("Corte y limado de uñas con cuidado higiénico")
                .precio(new BigDecimal("15000.00"))
                .duracionServicio(15)
                .build());

        Servicio s4 = servicioRepository.save(Servicio.builder()
                .nombre("Limpieza de Oídos")
                .descripcion("Limpieza profunda de canales auditivos")
                .precio(new BigDecimal("12000.00"))
                .duracionServicio(15)
                .build());

        Servicio s5 = servicioRepository.save(Servicio.builder()
                .nombre("Servicio Completo Spa")
                .descripcion("Baño, corte, uñas, oídos y perfume")
                .precio(new BigDecimal("85000.00"))
                .duracionServicio(90)
                .build());

        // 3. Mascotas
        Mascota firulais = mascotaRepository.save(Mascota.builder()
                .nombre("Firulais")
                .raza("Golden Retriever")
                .tipo(TipoMascota.Perro)
                .notas("Es muy amigable pero le tiene miedo al secador")
                .tamano(TamanoMascota.Grande)
                .usuario(carlos)
                .build());

        Mascota milo = mascotaRepository.save(Mascota.builder()
                .nombre("Milo")
                .raza("Poodle")
                .tipo(TipoMascota.Perro)
                .notas("Piel sensible, usar champú hipoalergénico")
                .tamano(TamanoMascota.Pequeno)
                .usuario(carlos)
                .build());

        Mascota luna = mascotaRepository.save(Mascota.builder()
                .nombre("Luna")
                .raza("Siamés")
                .tipo(TipoMascota.Gato)
                .notas("Suele ponerse nerviosa en el baño")
                .tamano(TamanoMascota.Pequeno)
                .usuario(laura)
                .build());

        Mascota max = mascotaRepository.save(Mascota.builder()
                .nombre("Max")
                .raza("Bulldog Francés")
                .tipo(TipoMascota.Perro)
                .notas("Requiere cuidado especial en las arrugas de la cara")
                .tamano(TamanoMascota.Mediano)
                .usuario(ana)
                .build());

        // 4. Reservas
        reservaRepository.save(Reserva.builder()
                .fecha(LocalDate.parse("2026-09-10"))
                .hora(LocalTime.parse("09:00:00"))
                .estado("PENDIENTE")
                .mascota(firulais)
                .servicios(List.of(s1, s3))
                .build());

        reservaRepository.save(Reserva.builder()
                .fecha(LocalDate.parse("2026-09-10"))
                .hora(LocalTime.parse("10:30:00"))
                .estado("CONFIRMADA")
                .mascota(milo)
                .servicios(List.of(s2))
                .build());

        reservaRepository.save(Reserva.builder()
                .fecha(LocalDate.parse("2026-09-11"))
                .hora(LocalTime.parse("14:00:00"))
                .estado("COMPLETADA")
                .mascota(luna)
                .servicios(List.of(s5))
                .build());

        reservaRepository.save(Reserva.builder()
                .fecha(LocalDate.parse("2026-09-12"))
                .hora(LocalTime.parse("11:00:00"))
                .estado("CANCELADA")
                .mascota(max)
                .servicios(List.of(s1, s4))
                .build());

        log.info("Datos de la Tarea 12 inicializados exitosamente.");
    }
}
