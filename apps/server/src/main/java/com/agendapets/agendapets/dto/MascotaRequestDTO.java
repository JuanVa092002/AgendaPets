package com.agendapets.agendapets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MascotaRequestDTO {
    private String nombre;
    private String raza;
    private String tipo;
    private String notas;
    private String tamano;
    private Long usuarioId;
    private String correoDueno;
}
