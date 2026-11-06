package com.safebaba.repository;

import com.safebaba.model.Baba;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BabaRepository extends JpaRepository<Baba, Long> {
    List<Baba> findByUsuarioCidadeIgnoreCaseContainingOrderByNotaMediaDesc(String cidade);
    boolean existsByUsuarioId(Long usuarioId);
    java.util.Optional<Baba> findByUsuarioId(Long usuarioId);
}
