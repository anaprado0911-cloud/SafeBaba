package com.safebaba.repository;
import com.safebaba.model.Evento; import java.util.List; import org.springframework.data.jpa.repository.JpaRepository;
public interface EventoRepository extends JpaRepository<Evento,Long> { List<Evento> findByAgendamentoIdOrderByCriadoEmAsc(Long agendamentoId); List<Evento> findByTipoOrderByCriadoEmDesc(String tipo); List<Evento> findByAgendamentoIdInOrderByCriadoEmDesc(java.util.Collection<Long> ids); }
