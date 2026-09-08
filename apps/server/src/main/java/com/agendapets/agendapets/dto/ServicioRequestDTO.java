package com.agendapets.agendapets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicioRequestDTO {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer duracionServicio;
    private String duracion;

    public Integer getDuracionServicioMinutos() {
        if (duracionServicio != null) {
            return duracionServicio;
        }
        if (duracion != null && !duracion.isBlank()) {
            String soloDigitos = duracion.replaceAll("\\D+", "");
            if (!soloDigitos.isBlank()) {
                try {
                    return Integer.parseInt(soloDigitos);
                } catch (NumberFormatException ignored) {}
            }
        }
        return 30; // valor por defecto si no se especifica
    }
}
