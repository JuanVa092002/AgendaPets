package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.UsuarioRequestDTO;
import com.agendapets.agendapets.dto.UsuarioResponseDTO;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponseDTO registrar(UsuarioRequestDTO dto) {
        String correo = dto.getCorreoEfectivo();
        if (correo == null || correo.isBlank()) {
            throw new IllegalArgumentException("El correo es obligatorio.");
        }
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado.");
        }

        String contrasena = dto.getContrasenaEfectiva();
        if (contrasena == null || contrasena.isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .estado(dto.getEstado() != null ? dto.getEstado() : true)
                .rol(dto.getRol() != null && !dto.getRol().isBlank() ? dto.getRol().toUpperCase() : "CLIENTE")
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        return mapToResponseDTO(guardado);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return mapToResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con correo: " + correo));
        return mapToResponseDTO(usuario);
    }

    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getContrasenaEfectiva() != null && !dto.getContrasenaEfectiva().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(dto.getContrasenaEfectiva()));
        }
        if (dto.getEstado() != null) {
            usuario.setEstado(dto.getEstado());
        }
        if (dto.getRol() != null && !dto.getRol().isBlank()) {
            usuario.setRol(dto.getRol().toUpperCase());
        }

        return mapToResponseDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    public UsuarioResponseDTO mapToResponseDTO(Usuario u) {
        return UsuarioResponseDTO.builder()
                .usuarioId(u.getUsuarioId())
                .nombre(u.getNombre())
                .correo(u.getCorreo())
                .email(u.getCorreo())
                .estado(u.getEstado())
                .rol(u.getRol() != null ? u.getRol().toLowerCase() : "cliente")
                .build();
    }
}
