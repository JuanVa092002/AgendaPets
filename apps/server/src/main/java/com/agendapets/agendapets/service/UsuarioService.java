package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.UsuarioRequestDTO;
import com.agendapets.agendapets.dto.UsuarioResponseDTO;
import com.agendapets.agendapets.exception.UsuarioDuplicadoException;
import com.agendapets.agendapets.model.Rol;
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
            throw new UsuarioDuplicadoException("El correo ya se encuentra registrado.");
        }

        String contrasena = dto.getContrasenaEfectiva();
        if (contrasena == null || contrasena.isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }

        if (dto.getRol() != null && !dto.getRol().isBlank()) {
            try {
                Rol.valueOf(dto.getRol().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rol inválido: " + dto.getRol() + ". Roles válidos: ADMIN, CLIENTE");
            }
        }

        Usuario usuario = Usuario.builder()
                .nombre(dto.getNombre())
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .celular(dto.getCelular())
                .estado(dto.getEstado() != null ? dto.getEstado() : true)
                .rol(Rol.CLIENTE)
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
        if (dto.getCelular() != null) {
            usuario.setCelular(dto.getCelular());
        }
        if (dto.getEstado() != null) {
            usuario.setEstado(dto.getEstado());
        }
        if (dto.getRol() != null && !dto.getRol().isBlank()) {
            try {
                usuario.setRol(Rol.valueOf(dto.getRol().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rol inválido: " + dto.getRol() + ". Roles válidos: ADMIN, CLIENTE");
            }
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
                .celular(u.getCelular())
                .estado(u.getEstado())
                .rol(u.getRol() != null ? u.getRol().name().toLowerCase() : "cliente")
                .build();
    }
}