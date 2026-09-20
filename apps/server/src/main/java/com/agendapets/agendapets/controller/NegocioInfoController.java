package com.agendapets.agendapets.controller;

import com.agendapets.agendapets.dto.NegocioInfoRequestDTO;
import com.agendapets.agendapets.model.NegocioInfo;
import com.agendapets.agendapets.service.NegocioInfoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/negocio")
public class NegocioInfoController {

    @Autowired
    private NegocioInfoService service;

    @GetMapping
    public ResponseEntity<NegocioInfo> obtenerInformacion() {
        return ResponseEntity.ok(service.obtenerInfo());
    }

    @PutMapping
    public ResponseEntity<NegocioInfo> actualizarInformacion(@Valid @RequestBody NegocioInfoRequestDTO datos) {
        return ResponseEntity.ok(service.actualizarInfo(datos));
    }
}