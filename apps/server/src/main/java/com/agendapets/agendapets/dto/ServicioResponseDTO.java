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
public class ServicioResponseDTO {
    private Long id;
    private Long servicioId;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer duracionServicio;
    private String duracion;
    private Boolean visible;
}
