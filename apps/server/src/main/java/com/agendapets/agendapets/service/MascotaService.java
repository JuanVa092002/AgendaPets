package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.MascotaRequestDTO;
import com.agendapets.agendapets.dto.MascotaResponseDTO;
import com.agendapets.agendapets.model.Mascota;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.MascotaRepository;
import com.agendapets.agendapets.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MascotaResponseDTO crear(MascotaRequestDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la mascota es obligatorio.");
        }

        Usuario usuario = null;
        if (dto.getUsuarioId() != null) {
            usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElse(null);
        }
        if (usuario == null && dto.getCorreoDueno() != null && !dto.getCorreoDueno().isBlank()) {
            usuario = usuarioRepository.findByCorreo(dto.getCorreoDueno().trim())
                    .orElse(null);
        }
        if (usuario == null) {
            // Si el usuario aún no existe con ese correo, o no viene ID, creamos un usuario cliente por defecto
            String correo = dto.getCorreoDueno() != null && !dto.getCorreoDueno().isBlank()
                    ? dto.getCorreoDueno().trim()
                    : "cliente@" + System.currentTimeMillis() + ".com";
            usuario = usuarioRepository.save(Usuario.builder()
                    .nombre("Dueño de " + dto.getNombre())
                    .correo(correo)
                    .contrasena("cliente123")
                    .estado(true)
                    .rol("CLIENTE")
                    .build());
        }

        Mascota mascota = Mascota.builder()
                .nombre(dto.getNombre())
                .raza(dto.getRaza() != null ? dto.getRaza() : "Mestizo")
                .tipo(dto.getTipo() != null && !dto.getTipo().isBlank() ? dto.getTipo() : "Perro")
                .notas(dto.getNotas())
                .tamano(dto.getTamano() != null && !dto.getTamano().isBlank() ? dto.getTamano() : "Mediano")
                .usuario(usuario)
                .build();

        return mapToResponseDTO(mascotaRepository.save(mascota));
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarTodas() {
        return mascotaRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarPorUsuario(Long usuarioId) {
        return mascotaRepository.findByUsuarioUsuarioId(usuarioId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaResponseDTO> listarPorCorreo(String correo) {
        return mascotaRepository.findByUsuarioCorreoIgnoreCase(correo.trim()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MascotaResponseDTO obtenerPorId(Long id) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));
        return mapToResponseDTO(mascota);
    }

    @Transactional
    public MascotaResponseDTO actualizar(Long id, MascotaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mascota no encontrada con ID: " + id));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            mascota.setNombre(dto.getNombre());
        }
        if (dto.getRaza() != null) {
            mascota.setRaza(dto.getRaza());
        }
        if (dto.getTipo() != null && !dto.getTipo().isBlank()) {
            mascota.setTipo(dto.getTipo());
        }
        if (dto.getTamano() != null && !dto.getTamano().isBlank()) {
            mascota.setTamano(dto.getTamano());
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
                .tipo(m.getTipo())
                .tamano(m.getTamano())
                .notas(m.getNotas())
                .usuarioId(m.getUsuario() != null ? m.getUsuario().getUsuarioId() : null)
                .nombreDueno(m.getUsuario() != null ? m.getUsuario().getNombre() : "")
                .correoDueno(m.getUsuario() != null ? m.getUsuario().getCorreo() : "")
                .build();
    }
}
