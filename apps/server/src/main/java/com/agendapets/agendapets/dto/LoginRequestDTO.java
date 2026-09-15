package com.agendapets.agendapets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {
    @NotBlank(message = "El correo es obligatorio")
    @JsonAlias("email")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @JsonAlias("password")
    private String contrasena;

    public String getCorreoEfectivo() {
        return correo != null ? correo.trim() : null;
    }
}
