package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.AuthResponseDTO;
import com.agendapets.agendapets.dto.LoginRequestDTO;
import com.agendapets.agendapets.exception.CredencialesInvalidasException;
import com.agendapets.agendapets.model.Usuario;
import com.agendapets.agendapets.repository.UsuarioRepository;
import com.agendapets.agendapets.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO iniciarSesion(LoginRequestDTO datos) {
        Usuario usuario = usuarioRepository.findByCorreo(datos.getCorreo().trim())
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new CredencialesInvalidasException("Esta cuenta se encuentra inactiva.");
        }

        if (!passwordEncoder.matches(datos.getContrasena(), usuario.getContrasena())) {
            throw new CredencialesInvalidasException("Usuario o contraseña incorrectos");
        }

        String token = jwtService.generarToken(usuario);

        return AuthResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .usuarioId(usuario.getUsuarioId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .build();
    }
}
