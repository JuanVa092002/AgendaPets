package com.agendapets.agendapets.repository;

import com.agendapets.agendapets.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByMascotaUsuarioUsuarioId(Long usuarioId);
    List<Reserva> findByMascotaUsuarioCorreoIgnoreCase(String correo);
    List<Reserva> findByMascotaIdMascota(Long idMascota);
    List<Reserva> findByFecha(LocalDate fecha);
    List<Reserva> findByEstado(String estado);
}
