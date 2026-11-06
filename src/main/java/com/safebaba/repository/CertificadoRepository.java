package com.safebaba.repository;
import com.safebaba.model.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CertificadoRepository extends JpaRepository<Certificado, Long> { long countByBabaId(Long babaId); java.util.List<Certificado> findByBabaId(Long babaId); }
