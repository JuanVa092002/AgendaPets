package com.agendapets.agendapets.repository;

import com.agendapets.agendapets.model.NegocioInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NegocioInfoRepository extends JpaRepository<NegocioInfo, Long> {
}