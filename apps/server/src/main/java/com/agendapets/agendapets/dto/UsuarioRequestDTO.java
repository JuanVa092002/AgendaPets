package com.agendapets.agendapets.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe ser válido")
    private String correo;
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
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
