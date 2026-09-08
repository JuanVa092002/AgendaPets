package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.ServicioRequestDTO;
import com.agendapets.agendapets.dto.ServicioResponseDTO;
import com.agendapets.agendapets.model.Servicio;
import com.agendapets.agendapets.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;

    @Transactional
    public ServicioResponseDTO crear(ServicioRequestDTO dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del servicio es obligatorio.");
        }
        if (dto.getPrecio() == null || dto.getPrecio().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio debe ser un número válido mayor o igual a 0.");
        }

        Servicio servicio = Servicio.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .duracionServicio(dto.getDuracionServicioMinutos())
                .build();

        return mapToResponseDTO(servicioRepository.save(servicio));
    }

    @Transactional(readOnly = true)
    public List<ServicioResponseDTO> listarTodos() {
        return servicioRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServicioResponseDTO obtenerPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado con ID: " + id));
        return mapToResponseDTO(servicio);
    }

    @Transactional
    public ServicioResponseDTO actualizar(Long id, ServicioRequestDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado con ID: " + id));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            servicio.setNombre(dto.getNombre());
        }
        if (dto.getDescripcion() != null) {
            servicio.setDescripcion(dto.getDescripcion());
        }
        if (dto.getPrecio() != null && dto.getPrecio().compareTo(BigDecimal.ZERO) >= 0) {
            servicio.setPrecio(dto.getPrecio());
        }
        if (dto.getDuracionServicio() != null || (dto.getDuracion() != null && !dto.getDuracion().isBlank())) {
            servicio.setDuracionServicio(dto.getDuracionServicioMinutos());
        }

        return mapToResponseDTO(servicioRepository.save(servicio));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new IllegalArgumentException("Servicio no encontrado con ID: " + id);
        }
        servicioRepository.deleteById(id);
    }

    public ServicioResponseDTO mapToResponseDTO(Servicio s) {
        String duracionTexto = s.getDuracionServicio() != null ? s.getDuracionServicio() + " min" : "30 min";
        return ServicioResponseDTO.builder()
                .id(s.getServicioId())
                .servicioId(s.getServicioId())
                .nombre(s.getNombre())
                .descripcion(s.getDescripcion())
                .precio(s.getPrecio())
                .duracionServicio(s.getDuracionServicio())
                .duracion(duracionTexto)
                .visible(true)
                .build();
    }
}
