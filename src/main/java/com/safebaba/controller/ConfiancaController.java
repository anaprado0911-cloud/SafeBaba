package com.safebaba.controller;
import com.safebaba.model.*;
import com.safebaba.repository.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

/** Índice de Confiança: nota de 0 a 100 explicável, recalculada a cada consulta com os dados do banco. */
@RestController @RequestMapping("/api/confianca")
public class ConfiancaController {
  private final BabaRepository br; private final AvaliacaoRepository ar; private final DocumentoVerificacaoRepository dr; private final CertificadoRepository cr;
  public ConfiancaController(BabaRepository br, AvaliacaoRepository ar, DocumentoVerificacaoRepository dr, CertificadoRepository cr){this.br=br;this.ar=ar;this.dr=dr;this.cr=cr;}
  @GetMapping public Map<Long, Map<String,Object>> todas(){ Map<Long, Map<String,Object>> m=new LinkedHashMap<>(); for(Baba b:br.findAll()) m.put(b.getId(), calc(b)); return m; }
  @GetMapping("/{id}") public Map<String,Object> uma(@PathVariable Long id){ return calc(br.findById(id).orElseThrow(()->new IllegalArgumentException("Babá não encontrada."))); }
  private Map<String,Object> calc(Baba b){
    List<Avaliacao> av=ar.findByBabaIdOrderByCriadoEmDesc(b.getId());
    boolean doc=dr.findByBabaId(b.getId()).map(d->"APROVADO".equals(d.getStatus())).orElse(false);
    int exp=b.getExperienciaAnos()==null?0:b.getExperienciaAnos();
    double nota=av.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
    double pont=av.isEmpty()?0:(double)av.stream().filter(a->Boolean.TRUE.equals(a.getPontualidade())).count()/av.size();
    List<Map<String,Object>> it=List.of(
      item("Documento aprovado", doc?30:0, 30), item("Experiência", Math.min(exp,5)*4, 20),
      item("Notas das famílias", nota/5*20, 20), item("Pontualidade", pont*10, 10),
      item("Volume de avaliações", Math.min(av.size(),8)/8.0*10, 10), item("Certificados", Math.min(cr.countByBabaId(b.getId()),2)*5, 10));
    int total=it.stream().mapToInt(i->(Integer)i.get("pontos")).sum();
    List<String> selos=new ArrayList<>(); if(doc) selos.add("Documento conferido"); if(cr.findByBabaId(b.getId()).stream().anyMatch(c->c.getNome()!=null&&c.getNome().toLowerCase().contains("socorros"))) selos.add("Primeiros socorros"); if(exp>=5) selos.add("5+ anos de experiência"); if(av.size()>=2&&pont>=0.8) selos.add("Pontual"); if(av.size()>=3) selos.add("Avaliada por famílias");
    return Map.of("babaId", b.getId(), "selos", selos, "score", total, "nivel", total>=85?"Excelente":total>=65?"Alta":"Em construção", "itens", it);
  }
  private Map<String,Object> item(String nome,double pontos,int max){ return Map.of("nome",nome,"pontos",(int)Math.round(pontos),"max",max); }
}
