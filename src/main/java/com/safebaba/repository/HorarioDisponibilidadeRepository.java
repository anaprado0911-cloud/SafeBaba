package com.safebaba.repository;
import com.safebaba.model.HorarioDisponibilidade; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface HorarioDisponibilidadeRepository extends JpaRepository<HorarioDisponibilidade,Long>{ List<HorarioDisponibilidade> findByBabaIdOrderByDiaSemanaAscHoraInicioAsc(Long babaId); void deleteByBabaId(Long babaId); boolean existsByBabaId(Long babaId); }
