package com.safebaba.repository;

import com.safebaba.model.Avaliacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByBabaIdOrderByCriadoEmDesc(Long babaId);
    boolean existsByAgendamentoId(Long agendamentoId);
}
