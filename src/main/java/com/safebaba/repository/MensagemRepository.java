package com.safebaba.repository;

import com.safebaba.model.Mensagem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByConversaIdOrderByEnviadaEmAsc(Long conversaId);
    List<Mensagem> findTop1ByConversaIdOrderByEnviadaEmDesc(Long conversaId);
    long countByConversaIdAndLidaFalseAndRemetenteIdNot(Long conversaId, Long remetenteId);
}
