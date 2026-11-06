package com.safebaba.repository;
import com.safebaba.model.AssinaturaPai; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface AssinaturaPaiRepository extends JpaRepository<AssinaturaPai,Long>{ Optional<AssinaturaPai> findByPaiId(Long paiId); }
