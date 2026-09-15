package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.NegocioInfoRequestDTO;
import com.agendapets.agendapets.model.NegocioInfo;
import com.agendapets.agendapets.service.NegocioInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negocio")
@CrossOrigin(origins = "*") // Ajusta el CrossOrigin según tu configuración de seguridad actual
public class NegocioInfoController {

    @Autowired
    private NegocioInfoService service;

    @GetMapping
    public ResponseEntity<NegocioInfo> obtenerInformacion() {
        return ResponseEntity.ok(service.obtenerInfo());
    }

    @PutMapping
    public ResponseEntity<NegocioInfo> actualizarInformacion(@RequestBody NegocioInfoRequestDTO datos) {
        return ResponseEntity.ok(service.actualizarInfo(datos));
    }
}