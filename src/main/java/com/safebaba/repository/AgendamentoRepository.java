package com.safebaba.repository;
import com.safebaba.model.Agendamento;
import java.time.LocalDate; import java.time.LocalTime; import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
 List<Agendamento> findByPaiIdOrderByDataServicoDesc(Long paiId);
 List<Agendamento> findByBabaIdOrderByDataServicoDesc(Long babaId);
 long countByPaiIdAndDataServicoBetween(Long paiId, LocalDate inicio, LocalDate fim);
 List<Agendamento> findByBabaIdAndDataServicoBetweenAndStatusIn(Long babaId, LocalDate inicio, LocalDate fim, List<com.safebaba.model.StatusAgendamento> status);
 List<Agendamento> findByBabaIdAndDataServicoAndStatusIn(Long babaId, LocalDate data, List<com.safebaba.model.StatusAgendamento> status);
}
