package com.safebaba.controller;
import com.safebaba.model.*; import com.safebaba.repository.*; import com.safebaba.service.PagamentoService;
import java.security.SecureRandom; import java.time.LocalDateTime; import java.util.*;
import org.springframework.security.access.AccessDeniedException; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
/** Código de chegada, check-in/out, diário ao vivo e SOS. Só participam o pai e a babá do agendamento. */
@RestController @RequestMapping("/api")
public class AtendimentoController {
  private final EventoRepository er; private final AgendamentoRepository ar; private final CuidadoRepository cur; private final PagamentoService pagamentoService;
  public AtendimentoController(EventoRepository er, AgendamentoRepository ar, CuidadoRepository cur, PagamentoService pagamentoService){this.er=er;this.ar=ar;this.cur=cur;this.pagamentoService=pagamentoService;}
  private Agendamento ag(Long id, Authentication a){ Agendamento g=ar.findById(id).orElseThrow(()->new IllegalArgumentException("Agendamento não encontrado.")); if(!ehPai(g,a)&&!ehBaba(g,a)) throw new AccessDeniedException("Acesso negado."); return g; }
  private boolean ehPai(Agendamento g, Authentication a){ return a.getName().equalsIgnoreCase(g.getPai().getUsuario().getEmail()); }
  private boolean ehBaba(Agendamento g, Authentication a){ return a.getName().equalsIgnoreCase(g.getBaba().getUsuario().getEmail()); }
  private List<Evento> lista(Long id){ return er.findByAgendamentoIdOrderByCriadoEmAsc(id); }
  private boolean tem(Long id, String tipo){ return lista(id).stream().anyMatch(e->e.tipo.equals(tipo)); }
  private Map<String,Object> reg(Long id, String tipo, String texto, Authentication a){ Evento e=new Evento(); e.agendamentoId=id; e.tipo=tipo; e.texto=texto; e.autor=a.getName(); e.criadoEm=LocalDateTime.now(); er.save(e); return Map.of("tipo",tipo,"texto",texto==null?"":texto,"criadoEm",e.criadoEm); }
  private String txt(Map<String,String> b, String k, int max){ String v=b==null?null:b.get(k); if(v==null||v.isBlank()) throw new IllegalArgumentException("Texto obrigatório."); v=v.trim(); return v.length()>max?v.substring(0,max):v; }

  @PostMapping("/atendimentos/{id}/codigo") public Map<String,Object> codigo(@PathVariable Long id, Authentication a){ Agendamento g=ag(id,a); if(!ehPai(g,a)) throw new AccessDeniedException("Só o responsável gera o código."); if(tem(id,"CHECKIN")) throw new IllegalArgumentException("A chegada já foi confirmada."); return reg(id,"CODIGO",String.valueOf(100000+new SecureRandom().nextInt(900000)),a); }
  @PostMapping("/atendimentos/{id}/checkin") public Map<String,Object> checkin(@PathVariable Long id, @RequestBody Map<String,String> b, Authentication a){ Agendamento g=ag(id,a); if(!ehBaba(g,a)) throw new AccessDeniedException("Só a babá confirma a chegada."); if(tem(id,"CHECKIN")) throw new IllegalArgumentException("Chegada já confirmada."); String cod=lista(id).stream().filter(e->e.tipo.equals("CODIGO")).reduce((x,y)->y).map(e->e.texto).orElseThrow(()->new IllegalArgumentException("O responsável ainda não gerou o código.")); if(!cod.equals(txt(b,"codigo",10))) throw new IllegalArgumentException("Código incorreto."); return reg(id,"CHECKIN","Babá chegou e confirmou o código.",a); }
  @PostMapping("/atendimentos/{id}/diario") public Map<String,Object> diario(@PathVariable Long id, @RequestBody Map<String,String> b, Authentication a){ Agendamento g=ag(id,a); if(!ehBaba(g,a)) throw new AccessDeniedException("Só a babá registra o diário."); if(!tem(id,"CHECKIN")||tem(id,"CHECKOUT")) throw new IllegalArgumentException("O atendimento não está em andamento."); return reg(id,"DIARIO",txt(b,"texto",300),a); }
  @PostMapping("/atendimentos/{id}/mensagem") public Map<String,Object> mensagem(@PathVariable Long id, @RequestBody Map<String,String> b, Authentication a){ ag(id,a); return reg(id,"MSG",txt(b,"texto",300),a); }
  @PostMapping("/atendimentos/{id}/pagar") public Map<String,Object> pagar(@PathVariable Long id, Authentication a){ ag(id,a); Map<String,Object> p=pagamentoService.pagar(id,a); reg(id,"PAGTO_RETIDO","Pagamento de R$ "+p.get("valor")+" retido até o fim do atendimento (PIX simulado).",a); return p; }
  @GetMapping("/atendimentos/{id}/cuidados") public List<Map<String,Object>> cuidados(@PathVariable Long id, Authentication a){ Agendamento g=ag(id,a); if(!ehPai(g,a)&&!(tem(id,"CHECKIN")&&!tem(id,"CHECKOUT"))) throw new AccessDeniedException("Disponível só durante o atendimento."); return cur.findByEmail(g.getPai().getUsuario().getEmail()).stream().map(c->Map.<String,Object>of("nome",c.nome==null?"":c.nome,"idade",c.idade==null?0:c.idade,"alergias",c.alergias==null?"":c.alergias,"remedios",c.remedios==null?"":c.remedios,"rotina",c.rotina==null?"":c.rotina,"pediatra",c.pediatra==null?"":c.pediatra,"contato",c.contato==null?"":c.contato)).toList(); }
  @GetMapping("/notificacoes") public List<Map<String,Object>> notificacoes(Authentication a){ Map<Long,Agendamento> m=new HashMap<>(); for(Agendamento g:ar.findAll()) if(ehPai(g,a)||ehBaba(g,a)) m.put(g.getId(),g); if(m.isEmpty()) return List.of(); return er.findByAgendamentoIdInOrderByCriadoEmDesc(m.keySet()).stream().filter(e->!a.getName().equalsIgnoreCase(e.autor)&&!e.tipo.equals("CODIGO")).limit(20).map(e->Map.<String,Object>of("agendamentoId",e.agendamentoId,"tipo",e.tipo,"texto",e.texto==null?"":e.texto,"criadoEm",e.criadoEm)).toList(); }
  @PostMapping("/atendimentos/{id}/sos") public Map<String,Object> sos(@PathVariable Long id, @RequestBody(required=false) Map<String,String> b, Authentication a){ Agendamento g=ag(id,a); String t=(ehBaba(g,a)?"Alerta da babá":"Alerta do responsável")+(b!=null&&b.get("local")!=null?" • local: "+b.get("local").replaceAll("[^0-9.,\\- ]","").trim():""); return reg(id,"SOS",t,a); }
  @PostMapping("/atendimentos/{id}/checkout") public Map<String,Object> checkout(@PathVariable Long id, Authentication a){ Agendamento g=ag(id,a); if(!ehBaba(g,a)) throw new AccessDeniedException("Só a babá encerra."); if(!tem(id,"CHECKIN")||tem(id,"CHECKOUT")) throw new IllegalArgumentException("O atendimento não está em andamento."); Map<String,Object> r=reg(id,"CHECKOUT","Atendimento encerrado.",a); g.setStatus(com.safebaba.model.StatusAgendamento.CONCLUIDO); ar.save(g); if(tem(id,"PAGTO_RETIDO")&&!tem(id,"PAGTO_LIBERADO")) { pagamentoService.liberarSeRetido(id); reg(id,"PAGTO_LIBERADO","Pagamento liberado à babá (simulado).",a); } return r; }
  @GetMapping("/atendimentos/{id}/linha") public List<Map<String,Object>> linha(@PathVariable Long id, Authentication a){ Agendamento g=ag(id,a); boolean pai=ehPai(g,a); return lista(id).stream().filter(e->pai||!e.tipo.equals("CODIGO")).map(e->Map.<String,Object>of("tipo",e.tipo,"texto",e.texto==null?"":e.texto,"criadoEm",e.criadoEm,"de",e.autor.equalsIgnoreCase(g.getPai().getUsuario().getEmail())?"PAI":"BABA")).toList(); }
  @GetMapping("/admin/sos") public List<Map<String,Object>> sosAdmin(){
    return er.findByTipoOrderByCriadoEmDesc("SOS").stream().map(e->{
      Map<String,Object> item=new LinkedHashMap<>();
      item.put("agendamentoId",e.agendamentoId);
      item.put("texto",e.texto==null?"":e.texto);
      item.put("criadoEm",e.criadoEm);
      // A localização já é recebida pelo endpoint SOS e preservada no texto do evento.
      // Extraímos as coordenadas sem exigir alteração no banco nem perder alertas antigos.
      if(e.texto!=null){
        java.util.regex.Matcher m=java.util.regex.Pattern.compile("local:\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)",java.util.regex.Pattern.CASE_INSENSITIVE).matcher(e.texto);
        if(m.find()){
          try {
            double lat=Double.parseDouble(m.group(1));
            double lng=Double.parseDouble(m.group(2));
            if(lat>=-90&&lat<=90&&lng>=-180&&lng<=180){item.put("latitude",lat);item.put("longitude",lng);}
          } catch(NumberFormatException ignored) { /* alerta sem coordenadas válidas */ }
        }
      }
      return item;
    }).toList();
  }
}
