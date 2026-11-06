package com.safebaba.repository;
import com.safebaba.model.DocumentoVerificacao;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DocumentoVerificacaoRepository extends JpaRepository<DocumentoVerificacao, Long> { Optional<DocumentoVerificacao> findByBabaId(Long babaId); }
