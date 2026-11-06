package com.safebaba.repository;
import com.safebaba.model.Favorito; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface FavoritoRepository extends JpaRepository<Favorito,Long> { List<Favorito> findByEmail(String email); Optional<Favorito> findByEmailAndBabaId(String email, Long babaId); }
