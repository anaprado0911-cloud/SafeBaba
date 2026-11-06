package com.safebaba.repository;
import com.safebaba.model.Pagamento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    Optional<Pagamento> findByAgendamentoId(Long agendamentoId);
    boolean existsByAgendamentoId(Long agendamentoId);
    List<Pagamento> findAllByOrderByCriadoEmDesc();
}
