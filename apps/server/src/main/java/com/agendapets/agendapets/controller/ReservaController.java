package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.ReservaRequestDTO;
import com.agendapets.agendapets.dto.ReservaResponseDTO;
import com.agendapets.agendapets.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping({"/reservas", "/api/reservas"})
    public ResponseEntity<List<ReservaResponseDTO>> listarTodas(
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) Long usuarioId
    ) {
        if (correo != null && !correo.isBlank()) {
            return ResponseEntity.ok(reservaService.listarPorCorreo(correo));
        }
        if (usuarioId != null) {
            return ResponseEntity.ok(reservaService.listarPorUsuario(usuarioId));
        }
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @GetMapping({"/reservas/usuario/{correo}", "/api/reservas/usuario/{correo}"})
    public ResponseEntity<List<ReservaResponseDTO>> listarPorCorreo(@PathVariable String correo) {
        return ResponseEntity.ok(reservaService.listarPorCorreo(correo));
    }

    @GetMapping({"/reservas/{id}", "/api/reservas/{id}"})
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservaService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping({"/reservas", "/api/reservas"})
    public ResponseEntity<?> crear(@RequestBody ReservaRequestDTO dto) {
        try {
            ReservaResponseDTO nueva = reservaService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping({"/reservas/{id}", "/api/reservas/{id}"})
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody ReservaRequestDTO dto) {
        try {
            return ResponseEntity.ok(reservaService.actualizar(id, dto));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PatchMapping({"/reservas/{id}/estado", "/api/reservas/{id}/estado"})
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.getOrDefault("estado", "CONFIRMADA");
            return ResponseEntity.ok(reservaService.cambiarEstado(id, nuevoEstado));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping({"/reservas/{id}", "/api/reservas/{id}"})
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            reservaService.eliminar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Reserva eliminada/cancelada correctamente.");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
