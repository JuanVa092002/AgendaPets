package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.MascotaRequestDTO;
import com.agendapets.agendapets.dto.MascotaResponseDTO;
import com.agendapets.agendapets.model.Mascota;
import com.agendapets.agendapets.model.Rol;
import com.agendapets.agendapets.model.TipoMascota;
import com.agendapets.agendapets.model.TamanoMascota;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.MascotaRepository;
import com.agendapets.agendapets.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MascotaResponseDTO crear(MascotaRequestDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la mascota es obligatorio.");
        }

        boolean admin = esAdmin();
        Usuario usuario = null;

        if (dto.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(dto.getUsuarioId()).orElse(null);
            if (usuario != null && !admin && !usuario.getCorreo().equalsIgnoreCase(correoActual())) {
                throw new IllegalStateException("No tienes permiso para registrar mascotas para otro usuario.");
            }
        }
        if (usuario == null && dto.getCorreoDueno() != null && !dto.getCorreoDueno().isBlank()) {
            usuario = usuarioRepository.findByCorreo(dto.getCorreoDueno().trim()).orElse(null);
            if (usuario != null && !admin && !usuario.getCorreo().equalsIgnoreCase(correoActual())) {
                throw new IllegalStateException("No tienes permiso para registrar mascotas para otro usuario.");
            }
        }
        if (usuario == null && !admin) {
            usuario = usuarioRepository.findByCorreo(correoActual())
                    .orElseThrow(() -> new IllegalStateException("El usuario autenticado no existe."));
        }
        if (usuario == null) {
            // Solo para administrador: crear usuario por defecto si no existe
            String correo = dto.getCorreoDueno() != null && !dto.getCorreoDueno().isBlank()
                    ? dto.getCorreoDueno().trim()
                    : "cliente@" + System.currentTimeMillis() + ".com";
            usuario = usuarioRepository.save(Usuario.builder()
                    .nombre("Dueño de " + dto.getNombre())
                    .correo(correo)
                    .contrasena(passwordEncoder.encode("cliente123"))
                    .estado(true)
                    .rol(Rol.CLIENTE)
                    .build());
        }

        Mascota mascota = Mascota.builder()
                .nombre(dto.getNombre())
                .raza(dto.getRaza() != null ? dto.getRaza() : "Mestizo")
                .tipo(dto.getTipo() != null && !dto.getTipo().isBlank() ? TipoMascota.valueOf(dto.getTipo()) : TipoMascota.Perro)
                .notas(dto.getNotas())
                .tamano(dto.getTamano() != null && !dto.getTamano().isBlank() ? TamanoMascota.valueOf(dto.getTamano()) : TamanoMascota.Mediano)
                .usuario(usuario)
                .build();

        return mapToResponseDTO(mascotaRepository.save(mascota));
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarTodas() {
        List<Mascota> mascotas = esAdmin()
                ? mascotaRepository.findAll()
                : mascotaRepository.findByUsuarioCorreoIgnoreCase(correoActual());
        return mascotas.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarPorUsuario(Long usuarioId) {
        if (!esAdmin()) {
            Long idActual = usuarioRepository.findByCorreo(correoActual())
                    .map(Usuario::getUsuarioId).orElse(null);
            if (!usuarioId.equals(idActual)) {
                throw new IllegalStateException("No tienes permiso para ver las mascotas de otro usuario.");
            }
        }
        return mascotaRepository.findByUsuarioUsuarioId(usuarioId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarPorCorreo(String correo) {
        if (!esAdmin() && !correo.trim().equalsIgnoreCase(correoActual())) {
            throw new IllegalStateException("No tienes permiso para ver las mascotas de otro usuario.");
        }
        return mascotaRepository.findByUsuarioCorreoIgnoreCase(correo.trim()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MascotaResponseDTO obtenerPorId(Long id) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));
        verificarAccesoMascota(mascota);
        return mapToResponseDTO(mascota);
    }

    @Transactional
    public MascotaResponseDTO actualizar(Long id, MascotaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));
        verificarAccesoMascota(mascota);

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            mascota.setNombre(dto.getNombre());
        }
        if (dto.getRaza() != null) {
            mascota.setRaza(dto.getRaza());
        }
        if (dto.getTipo() != null && !dto.getTipo().isBlank()) {
            mascota.setTipo(TipoMascota.valueOf(dto.getTipo()));
        }
        if (dto.getTamano() != null && !dto.getTamano().isBlank()) {
            mascota.setTamano(TamanoMascota.valueOf(dto.getTamano()));
        }
        if (dto.getNotas() != null) {
            mascota.setNotas(dto.getNotas());
        }

        return mapToResponseDTO(mascotaRepository.save(mascota));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!mascotaRepository.existsById(id)) {
            throw new IllegalArgumentException("Mascota no encontrada con ID: " + id);
        }
        mascotaRepository.deleteById(id);
    }

    public MascotaResponseDTO mapToResponseDTO(Mascota m) {
        return MascotaResponseDTO.builder()
                .idMascota(m.getIdMascota())
                .id(m.getIdMascota())
                .nombre(m.getNombre())
                .raza(m.getRaza())
                .tipo(m.getTipo() != null ? m.getTipo().name() : null)
                .tamano(m.getTamano() != null ? m.getTamano().name() : null)
                .notas(m.getNotas())
                .usuarioId(m.getUsuario() != null ? m.getUsuario().getUsuarioId() : null)
                .nombreDueno(m.getUsuario() != null ? m.getUsuario().getNombre() : "")
                .correoDueno(m.getUsuario() != null ? m.getUsuario().getCorreo() : "")
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

    private void verificarAccesoMascota(Mascota mascota) {
        if (esAdmin()) {
            return;
        }
        String dueno = mascota.getUsuario() != null ? mascota.getUsuario().getCorreo() : null;
        if (dueno == null || !dueno.equalsIgnoreCase(correoActual())) {
            throw new IllegalStateException("No tienes permiso para acceder a esta mascota.");
        }
    }
}
