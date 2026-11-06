package com.safebaba.repository;
import com.safebaba.model.BloqueioAgenda; import org.springframework.data.jpa.repository.JpaRepository; import java.time.*; import java.util.*;
public interface BloqueioAgendaRepository extends JpaRepository<BloqueioAgenda,Long>{ List<BloqueioAgenda> findByBabaIdAndInicioLessThanAndFimGreaterThanOrderByInicioAsc(Long babaId,LocalDateTime fim,LocalDateTime inicio); List<BloqueioAgenda> findByBabaIdAndInicioBetweenOrderByInicioAsc(Long babaId,LocalDateTime inicio,LocalDateTime fim); Optional<BloqueioAgenda> findByIdAndBabaId(Long id,Long babaId); }
