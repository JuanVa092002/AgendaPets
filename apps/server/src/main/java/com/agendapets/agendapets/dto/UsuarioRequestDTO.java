package com.agendapets.agendapets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioRequestDTO {
    private String nombre;
    private String correo;
    private String email;
    private String contrasena;
    private String password;
    private Boolean estado;
    private String rol;

    public String getCorreoEfectivo() {
        if (correo != null && !correo.isBlank()) {
            return correo.trim();
        }
        return email != null ? email.trim() : null;
    }

    public String getContrasenaEfectiva() {
        if (contrasena != null && !contrasena.isBlank()) {
            return contrasena;
        }
        return password;
    }
}
