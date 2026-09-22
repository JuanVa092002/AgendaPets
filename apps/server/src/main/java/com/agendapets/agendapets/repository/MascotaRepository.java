package com.agendapets.agendapets.repository;

import com.agendapets.agendapets.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByUsuarioUsuarioId(Long usuarioId);
    List<Mascota> findByUsuarioCorreoIgnoreCase(String correo);
}
