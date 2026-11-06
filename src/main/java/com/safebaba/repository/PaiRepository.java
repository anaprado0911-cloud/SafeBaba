package com.safebaba.repository;
import com.safebaba.model.PaiResponsavel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaiRepository extends JpaRepository<PaiResponsavel, Long> { Optional<PaiResponsavel> findByUsuarioId(Long usuarioId); }
