package com.safebaba.controller;
import com.safebaba.model.*; import com.safebaba.repository.BabaRepository; import com.safebaba.service.AgendaDisponibilidadeService; import org.springframework.security.core.Authentication; import org.springframework.security.access.AccessDeniedException; import org.springframework.web.bind.annotation.*; import java.time.*; import java.util.*;
@RestController @RequestMapping("/api/babas/minha-agenda-config") public class DisponibilidadeController {
 private final AgendaDisponibilidadeService service; private final BabaRepository br;
 public DisponibilidadeController(AgendaDisponibilidadeService s,BabaRepository br){this.service=s;this.br=br;}
 private Baba baba(Authentication a){return br.findAll().stream().filter(b->b.getUsuario().getEmail().equalsIgnoreCase(a.getName())).findFirst().orElseThrow(()->new AccessDeniedException("Perfil de babá não encontrado."));}
 @GetMapping("/horarios") public List<AgendaDisponibilidadeService.Slot> horarios(Authentication a){return service.horarios(baba(a).getId()).stream().map(h->new AgendaDisponibilidadeService.Slot(h.getDiaSemana(),h.getHoraInicio(),h.getHoraFim())).toList();}
 @PutMapping("/horarios") public List<AgendaDisponibilidadeService.Slot> salvar(@RequestBody List<AgendaDisponibilidadeService.Slot> slots,Authentication a){return service.salvar(baba(a).getId(),slots).stream().map(h->new AgendaDisponibilidadeService.Slot(h.getDiaSemana(),h.getHoraInicio(),h.getHoraFim())).toList();}
 @GetMapping("/bloqueios") public List<Map<String,Object>> bloqueios(@RequestParam LocalDate inicio,@RequestParam LocalDate fim,Authentication a){return service.bloqueios(baba(a).getId(),inicio,fim).stream().map(b->Map.<String,Object>of("id",b.getId(),"inicio",b.getInicio(),"fim",b.getFim(),"motivo",b.getMotivo()==null?"":b.getMotivo())).toList();}
 @PostMapping("/bloqueios") public Map<String,Object> bloquear(@RequestBody BloqueioRequest r,Authentication a){var b=service.bloquear(baba(a).getId(),r.inicio(),r.fim(),r.motivo());return Map.of("id",b.getId(),"inicio",b.getInicio(),"fim",b.getFim());}
 @DeleteMapping("/bloqueios/{id}") public void remover(@PathVariable Long id,Authentication a){service.removerBloqueio(baba(a).getId(),id);}
 public record BloqueioRequest(LocalDateTime inicio,LocalDateTime fim,String motivo){}
}
