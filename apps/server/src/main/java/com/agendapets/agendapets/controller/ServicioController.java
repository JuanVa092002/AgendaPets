package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.ServicioRequestDTO;
import com.agendapets.agendapets.dto.ServicioResponseDTO;
import com.agendapets.agendapets.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioService servicioService;

    @GetMapping({"/servicios", "/api/servicios"})
    public ResponseEntity<List<ServicioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(servicioService.listarTodos());
    }

    @GetMapping({"/servicios/{id}", "/api/servicios/{id}"})
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(servicioService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping({"/servicios", "/api/servicios"})
    public ResponseEntity<?> crear(@RequestBody ServicioRequestDTO dto) {
        try {
            ServicioResponseDTO nuevo = servicioService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping({"/servicios/{id}", "/api/servicios/{id}"})
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody ServicioRequestDTO dto) {
        try {
            return ResponseEntity.ok(servicioService.actualizar(id, dto));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping({"/servicios/{id}", "/api/servicios/{id}"})
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            servicioService.eliminar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Servicio eliminado correctamente.");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
