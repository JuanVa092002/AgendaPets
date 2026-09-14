package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.ReservaRequestDTO;
import com.agendapets.agendapets.dto.ReservaResponseDTO;
import com.agendapets.agendapets.dto.ServicioResponseDTO;
import com.agendapets.agendapets.model.Mascota;
import com.agendapets.agendapets.model.Reserva;
import com.agendapets.agendapets.model.Servicio;
import com.agendapets.agendapets.model.Rol;
import com.agendapets.agendapets.model.TipoMascota;
import com.agendapets.agendapets.model.TamanoMascota;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.MascotaRepository;
import com.agendapets.agendapets.repository.ReservaRepository;
import com.agendapets.agendapets.repository.ServicioRepository;
import com.agendapets.agendapets.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final ServicioRepository servicioRepository;
    private final UsuarioRepository usuarioRepository;
    private final MascotaService mascotaService;
    private final ServicioService servicioService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ReservaResponseDTO crear(ReservaRequestDTO dto) {
        LocalDate fecha = dto.getFecha() != null ? dto.getFecha() : LocalDate.now();
        LocalTime hora = dto.getHoraEfectiva();

        boolean admin = esAdmin();
        String correoAutenticado = admin ? null : correoActual();

        // 1. Obtener o crear Mascota
        Mascota mascota = null;
        if (dto.getIdMascota() != null) {
            mascota = mascotaRepository.findById(dto.getIdMascota()).orElse(null);
            if (mascota != null && !admin) {
                String dueno = mascota.getUsuario() != null ? mascota.getUsuario().getCorreo() : null;
                if (dueno == null || !dueno.equalsIgnoreCase(correoAutenticado)) {
                    throw new IllegalStateException("No tienes permiso para reservar con esta mascota.");
                }
            }
        }
        if (mascota == null) {
            // Buscar o crear usuario
            String correoDueno = dto.getCorreoDueno() != null ? dto.getCorreoDueno().trim()
                    : (dto.getDuenoId() != null ? dto.getDuenoId().trim() : null);
            if (correoAutenticado != null) {
                correoDueno = correoAutenticado;
            } else if (correoDueno == null) {
                correoDueno = "cliente@agendapets.com";
            }
            String finalCorreoDueno = correoDueno;
            Usuario usuario = usuarioRepository.findByCorreo(correoDueno).orElseGet(() -> {
                return usuarioRepository.save(Usuario.builder()
                        .nombre(dto.getNombreDueno() != null ? dto.getNombreDueno() : "Cliente")
                        .correo(finalCorreoDueno)
                        .contrasena(passwordEncoder.encode("cliente123"))
                        .estado(true)
                        .rol(Rol.CLIENTE)
                        .build());
            });

            String nombreMascota = dto.getNombreMascota() != null && !dto.getNombreMascota().isBlank()
                    ? dto.getNombreMascota() : "Mascota";

            mascota = mascotaRepository.save(Mascota.builder()
                    .nombre(nombreMascota)
                    .tipo(dto.getTipoMascota() != null ? TipoMascota.valueOf(dto.getTipoMascota()) : TipoMascota.Perro)
                    .raza(dto.getRazaMascota() != null ? dto.getRazaMascota() : "Mestizo")
                    .tamano(dto.getTamanoMascota() != null ? TamanoMascota.valueOf(dto.getTamanoMascota()) : TamanoMascota.Mediano)
                    .notas(dto.getNotasMascota())
                    .usuario(usuario)
                    .build());
        }

        // 2. Asociar servicios
        List<Servicio> servicios = new ArrayList<>();
        if (dto.getServicioIds() != null && !dto.getServicioIds().isEmpty()) {
            servicios = servicioRepository.findAllById(dto.getServicioIds());
        }
        if (servicios.isEmpty()) {
            // Asignar primer servicio disponible por defecto si existe
            List<Servicio> todos = servicioRepository.findAll();
            if (!todos.isEmpty()) {
                servicios.add(todos.get(0));
            }
        }

        String estado = dto.getEstado() != null && !dto.getEstado().isBlank() ? dto.getEstado().toUpperCase() : "PENDIENTE";

        Reserva reserva = Reserva.builder()
                .fecha(fecha)
                .hora(hora)
                .estado(estado)
                .mascota(mascota)
                .servicios(servicios)
                .build();

        return mapToResponseDTO(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas() {
        List<Reserva> reservas = esAdmin()
                ? reservaRepository.findAll()
                : reservaRepository.findByMascotaUsuarioCorreoIgnoreCase(correoActual());
        return reservas.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarPorUsuario(Long usuarioId) {
        if (!esAdmin()) {
            Long idActual = usuarioRepository.findByCorreo(correoActual())
                    .map(Usuario::getUsuarioId).orElse(null);
            if (!usuarioId.equals(idActual)) {
                throw new IllegalStateException("No tienes permiso para ver las reservas de otro usuario.");
            }
        }
        return reservaRepository.findByMascotaUsuarioUsuarioId(usuarioId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarPorCorreo(String correo) {
        if (!esAdmin() && !correo.trim().equalsIgnoreCase(correoActual())) {
            throw new IllegalStateException("No tienes permiso para ver las reservas de otro usuario.");
        }
        return reservaRepository.findByMascotaUsuarioCorreoIgnoreCase(correo.trim()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservaResponseDTO obtenerPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));
        verificarAccesoReserva(reserva);
        return mapToResponseDTO(reserva);
    }

    @Transactional
    public ReservaResponseDTO actualizar(Long id, ReservaRequestDTO dto) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));
        verificarAccesoReserva(reserva);

        if (dto.getFecha() != null) {
            reserva.setFecha(dto.getFecha());
        }
        if (dto.getHora() != null || dto.getHoraString() != null) {
            reserva.setHora(dto.getHoraEfectiva());
        }
        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            reserva.setEstado(dto.getEstado().toUpperCase());
        }
        if (dto.getServicioIds() != null && !dto.getServicioIds().isEmpty()) {
            List<Servicio> nuevosServicios = servicioRepository.findAllById(dto.getServicioIds());
            reserva.setServicios(nuevosServicios);
        }

        return mapToResponseDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaResponseDTO cambiarEstado(Long id, String nuevoEstado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));
        verificarAccesoReserva(reserva);
        reserva.setEstado(nuevoEstado.toUpperCase());
        return mapToResponseDTO(reservaRepository.save(reserva));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new IllegalArgumentException("Reserva no encontrada con ID: " + id);
        }
        reservaRepository.deleteById(id);
    }

    public ReservaResponseDTO mapToResponseDTO(Reserva r) {
        List<ServicioResponseDTO> serviciosDTO = r.getServicios().stream()
                .map(servicioService::mapToResponseDTO)
                .collect(Collectors.toList());

        BigDecimal total = r.getServicios().stream()
                .map(s -> s.getPrecio() != null ? s.getPrecio() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String nombreServicio = r.getServicios().isEmpty()
                ? "Sin servicio asignado"
                : r.getServicios().size() == 1
                ? r.getServicios().get(0).getNombre()
                : r.getServicios().get(0).getNombre() + " +" + (r.getServicios().size() - 1);

        String horaStr = r.getHora() != null ? r.getHora().format(DateTimeFormatter.ofPattern("HH:mm")) : "";

        return ReservaResponseDTO.builder()
                .reservaId(r.getReservaId())
                .id(r.getReservaId())
                .fecha(r.getFecha())
                .hora(r.getHora())
                .horaFormato(horaStr)
                .estado(r.getEstado())
                .mascota(r.getMascota() != null ? mascotaService.mapToResponseDTO(r.getMascota()) : null)
                .mascotaNombre(r.getMascota() != null ? r.getMascota().getNombre() : "")
                .duenoNombre(r.getMascota() != null && r.getMascota().getUsuario() != null ? r.getMascota().getUsuario().getNombre() : "")
                .correoDueno(r.getMascota() != null && r.getMascota().getUsuario() != null ? r.getMascota().getUsuario().getCorreo() : "")
                .servicios(serviciosDTO)
                .servicio(nombreServicio)
                .precioTotal(total)
                .build();
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private String correoActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String correo)) {
            throw new IllegalStateException("No hay un usuario autenticado.");
        }
        return correo;
    }

    private void verificarAccesoReserva(Reserva reserva) {
        if (esAdmin()) {
            return;
        }
        String dueno = reserva.getMascota() != null && reserva.getMascota().getUsuario() != null
                ? reserva.getMascota().getUsuario().getCorreo() : null;
        if (dueno == null || !dueno.equalsIgnoreCase(correoActual())) {
            throw new IllegalStateException("No tienes permiso para acceder a esta reserva.");
        }
    }
}
