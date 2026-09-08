package com.agendapets.agendapets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaResponseDTO {
    private Long reservaId;
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private String horaFormato;
    private String estado;
    private MascotaResponseDTO mascota;
    private String mascotaNombre;
    private String duenoNombre;
    private String correoDueno;
    @Builder.Default
    private List<ServicioResponseDTO> servicios = new ArrayList<>();
    private String servicio;
    private BigDecimal precioTotal;
}
