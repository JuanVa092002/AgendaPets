package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.MascotaRequestDTO;
import com.agendapets.agendapets.dto.MascotaResponseDTO;
import com.agendapets.agendapets.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;

    @GetMapping({"/mascotas", "/api/mascotas"})
    public ResponseEntity<List<MascotaResponseDTO>> listarTodas(
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) Long usuarioId
    ) {
        if (correo != null && !correo.isBlank()) {
            return ResponseEntity.ok(mascotaService.listarPorCorreo(correo));
        }
        if (usuarioId != null) {
            return ResponseEntity.ok(mascotaService.listarPorUsuario(usuarioId));
        }
        return ResponseEntity.ok(mascotaService.listarTodas());
    }

    @GetMapping({"/mascotas/usuario/{usuarioId}", "/api/mascotas/usuario/{usuarioId}"})
    public ResponseEntity<List<MascotaResponseDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(mascotaService.listarPorUsuario(usuarioId));
    }

    @GetMapping({"/mascotas/{id}", "/api/mascotas/{id}"})
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(mascotaService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping({"/mascotas", "/api/mascotas"})
    public ResponseEntity<?> crear(@RequestBody MascotaRequestDTO dto) {
        try {
            MascotaResponseDTO nueva = mascotaService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping({"/mascotas/{id}", "/api/mascotas/{id}"})
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody MascotaRequestDTO dto) {
        try {
            return ResponseEntity.ok(mascotaService.actualizar(id, dto));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping({"/mascotas/{id}", "/api/mascotas/{id}"})
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            mascotaService.eliminar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Mascota eliminada correctamente.");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
