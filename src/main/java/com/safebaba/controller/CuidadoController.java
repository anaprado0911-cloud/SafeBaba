package com.safebaba.controller;
import com.safebaba.model.Cuidado; import com.safebaba.repository.CuidadoRepository; import java.util.*;
import org.springframework.security.access.AccessDeniedException; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
/** CRUD do cartão de cuidados, restrito ao responsável dono. */
@RestController @RequestMapping("/api/cuidados")
public class CuidadoController {
  private final CuidadoRepository cr; public CuidadoController(CuidadoRepository cr){this.cr=cr;}
  private static String s(Map<String,String> b,String k,int max){ String v=b.get(k); if(v==null) return null; v=v.trim(); return v.length()>max?v.substring(0,max):v; }
  @GetMapping public List<Cuidado> listar(Authentication a){ return cr.findByEmail(a.getName()); }
  @PostMapping public Cuidado criar(@RequestBody Map<String,String> b, Authentication a){ Cuidado c=new Cuidado(); c.email=a.getName(); c.nome=s(b,"nome",80); if(c.nome==null||c.nome.isEmpty()) throw new IllegalArgumentException("Informe o nome da criança."); try{ c.idade=Integer.valueOf(s(b,"idade",3)); }catch(Exception e){ throw new IllegalArgumentException("Idade inválida."); } c.alergias=s(b,"alergias",200); c.remedios=s(b,"remedios",200); c.rotina=s(b,"rotina",200); c.pediatra=s(b,"pediatra",120); c.contato=s(b,"contato",120); return cr.save(c); }
  @DeleteMapping("/{id}") public Map<String,Object> remover(@PathVariable Long id, Authentication a){ Cuidado c=cr.findById(id).orElseThrow(()->new IllegalArgumentException("Não encontrado.")); if(!a.getName().equalsIgnoreCase(c.email)) throw new AccessDeniedException("Acesso negado."); cr.delete(c); return Map.of("removido",true); }
}
