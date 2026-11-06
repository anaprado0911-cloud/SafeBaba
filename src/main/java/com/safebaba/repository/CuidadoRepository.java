package com.safebaba.repository;
import com.safebaba.model.Cuidado; import java.util.List; import org.springframework.data.jpa.repository.JpaRepository;
public interface CuidadoRepository extends JpaRepository<Cuidado,Long> { List<Cuidado> findByEmail(String email); }
