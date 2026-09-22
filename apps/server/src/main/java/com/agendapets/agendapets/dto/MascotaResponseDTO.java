package com.agendapets.agendapets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MascotaResponseDTO {
    private Long idMascota;
    private Long id;
    private String nombre;
    private String raza;
    private String tipo;
    private String tamano;
    private String notas;
    private Long usuarioId;
    private String nombreDueno;
    private String correoDueno;
}
