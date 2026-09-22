package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.UsuarioRequestDTO;
import com.agendapets.agendapets.dto.UsuarioResponseDTO;
import com.agendapets.agendapets.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping({"/registro", "/api/usuarios/registro", "/api/usuarios"})
    public ResponseEntity<?> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        try {
            UsuarioResponseDTO usuario = usuarioService.registrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping({"/usuarios", "/api/usuarios"})
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping({"/usuarios/{id}", "/api/usuarios/{id}"})
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerPorId(id));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping({"/usuarios/{id}", "/api/usuarios/{id}"})
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody UsuarioRequestDTO dto) {
        try {
            return ResponseEntity.ok(usuarioService.actualizar(id, dto));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping({"/usuarios/{id}", "/api/usuarios/{id}"})
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            usuarioService.eliminar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Usuario eliminado correctamente.");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
