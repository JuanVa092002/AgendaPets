package com.agendapets.agendapets.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaRequestDTO {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime hora;

    private String horaString;

    private Long idMascota;
    private String nombreMascota;
    private String tipoMascota;
    private String razaMascota;
    private String tamanoMascota;
    private String notasMascota;

    private Long usuarioId;
    private String correoDueno;
    private String duenoId;
    private String nombreDueno;

    @Builder.Default
    private List<Long> servicioIds = new ArrayList<>();

    private String estado;

    public LocalTime getHoraEfectiva() {
        if (hora != null) return hora;
        if (horaString != null && !horaString.isBlank()) {
            try {
                String clean = horaString.trim();
                if (clean.length() == 5) {
                    return LocalTime.parse(clean);
                }
                if (clean.length() == 8) {
                    return LocalTime.parse(clean);
                }
            } catch (Exception ignored) {}
        }
        return LocalTime.of(9, 0);
    }
}
