package com.agendapets.agendapets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonAlias("email")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @JsonAlias("password")
    private String contrasena;

    @Size(max = 20, message = "El celular no puede superar los 20 caracteres")
    private String celular;

    private Boolean estado;
    private String rol;

    public String getCorreoEfectivo() {
        return correo != null ? correo.trim() : null;
    }

    public String getContrasenaEfectiva() {
        return contrasena;
    }
}