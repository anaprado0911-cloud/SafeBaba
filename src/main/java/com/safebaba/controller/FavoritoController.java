package com.safebaba.controller;
import com.safebaba.model.Favorito; import com.safebaba.repository.*; import java.util.*;
import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
/** Favoritos do usuário logado (por e-mail). */
@RestController @RequestMapping("/api/favoritos")
public class FavoritoController {
  private final FavoritoRepository fr; private final BabaRepository br;
  public FavoritoController(FavoritoRepository fr, BabaRepository br){this.fr=fr;this.br=br;}
  @GetMapping public List<Long> listar(Authentication a){ return fr.findByEmail(a.getName()).stream().map(f->f.babaId).toList(); }
  @PostMapping("/{babaId}") public Map<String,Object> alternar(@PathVariable Long babaId, Authentication a){ if(!br.existsById(babaId)) throw new IllegalArgumentException("Babá não encontrada."); var f=fr.findByEmailAndBabaId(a.getName(),babaId); if(f.isPresent()){ fr.delete(f.get()); return Map.of("favorito",false); } Favorito n=new Favorito(); n.email=a.getName(); n.babaId=babaId; fr.save(n); return Map.of("favorito",true); }
}
