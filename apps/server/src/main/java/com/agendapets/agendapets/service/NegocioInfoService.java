package com.agendapets.agendapets.service;

import com.agendapets.agendapets.dto.NegocioInfoRequestDTO;
import com.agendapets.agendapets.model.NegocioInfo;
import com.agendapets.agendapets.repository.NegocioInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NegocioInfoService {

    @Autowired
    private NegocioInfoRepository repository;

    public NegocioInfo obtenerInfo() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            NegocioInfo defaultInfo = new NegocioInfo(
                    "AgendaPets",
                    "admin@agendapets.com",
                    "Chapinero, Bogotá",
                    "+57 310 555 7890"
            );
            return repository.save(defaultInfo);
        });
    }

    public NegocioInfo actualizarInfo(NegocioInfoRequestDTO dto) {
        NegocioInfo infoActual = obtenerInfo();

        infoActual.setNombre(dto.getNombre());
        infoActual.setCorreo(dto.getCorreo());
        infoActual.setDireccion(dto.getDireccion());
        infoActual.setTelefono(dto.getTelefono());
        if (dto.getHorariosJson() != null) {
            infoActual.setHorariosJson(dto.getHorariosJson());
        }

        return repository.save(infoActual);
    }
}