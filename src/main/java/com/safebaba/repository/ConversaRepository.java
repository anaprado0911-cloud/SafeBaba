package com.safebaba.repository;

import com.safebaba.model.Conversa;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {
    Optional<Conversa> findByPaiIdAndBabaId(Long paiId, Long babaId);
    java.util.List<Conversa> findAllByBabaIdOrderByCriadaEmDesc(Long babaId);
}
