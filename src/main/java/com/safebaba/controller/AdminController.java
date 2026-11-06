package com.safebaba.controller;

import com.safebaba.model.*;
import com.safebaba.repository.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

/** Indicadores, moderação de documentos e verificação de babás. Protegido por ROLE_ADMIN. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final UsuarioRepository ur;
  private final BabaRepository br;
  private final AgendamentoRepository agr;
  private final DenunciaRepository dr;
  private final EventoRepository er;
  private final DocumentoVerificacaoRepository dcr;

  public AdminController(UsuarioRepository ur, BabaRepository br, AgendamentoRepository agr,
      DenunciaRepository dr, EventoRepository er, DocumentoVerificacaoRepository dcr) {
    this.ur=ur; this.br=br; this.agr=agr; this.dr=dr; this.er=er; this.dcr=dcr;
  }

  @GetMapping("/resumo")
  public Map<String,Object> resumo() {
    long verificadas=br.findAll().stream().filter(b -> Boolean.TRUE.equals(b.getVerificada())).count();
    long pendentes=br.findAll().stream().filter(b -> !Boolean.TRUE.equals(b.getVerificada())
        && !"REPROVADA".equals(b.getStatusVerificacao())).count();
    long reprovadas=br.findAll().stream().filter(b -> "REPROVADA".equals(b.getStatusVerificacao())).count();
    long docsPendentes=dcr.findAll().stream().filter(d -> "PENDENTE".equals(d.getStatus())).count();
    Map<String,Object> r=new LinkedHashMap<>();
    r.put("usuarios",ur.count()); r.put("babasVerificadas",verificadas);
    r.put("babasPendentes",pendentes); r.put("babasReprovadas",reprovadas);
    r.put("documentosPendentes",docsPendentes); r.put("agendamentos",agr.count());
    r.put("denuncias",dr.count()); r.put("sos",er.findByTipoOrderByCriadoEmDesc("SOS").size());
    return r;
  }

  @GetMapping("/documentos/pendentes")
  public List<Map<String,Object>> pendentes() {
    return dcr.findAll().stream().filter(d -> "PENDENTE".equals(d.getStatus()))
      .map(d -> { Map<String,Object> m=new LinkedHashMap<>();
        m.put("id",d.getId()); m.put("babaId",d.getBaba().getId());
        m.put("nome",d.getBaba().getUsuario().getNome()); m.put("tipo",d.getTipo());
        m.put("status",d.getStatus()); m.put("nomeArquivo",d.getArquivoNome()); m.put("temArquivo",d.getArquivoDados()!=null); m.put("motivoReprovacao",d.getMotivoReprovacao()); return m;
      }).toList();
  }

  /** Mantém a rota existente. Aprovar o documento não aprova automaticamente o perfil da babá. */
  @GetMapping("/documentos/{babaId}/arquivo")
  public org.springframework.http.ResponseEntity<byte[]> arquivoDocumento(@PathVariable Long babaId) {
    DocumentoVerificacao d=dcr.findByBabaId(babaId)
      .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado."));
    if (d.getArquivoDados()==null) throw new IllegalArgumentException("Arquivo do documento não encontrado.");
    return org.springframework.http.ResponseEntity.ok()
      .contentType(org.springframework.http.MediaType.parseMediaType(d.getArquivoTipo()==null?"application/octet-stream":d.getArquivoTipo()))
      .header("Content-Disposition","inline; filename=\"" + (d.getArquivoNome()==null?"documento":d.getArquivoNome().replace("\"","")) + "\"")
      .body(d.getArquivoDados());
  }

  @PostMapping("/documentos/{babaId}/aprovar")
  public Map<String,Object> aprovarDocumento(@PathVariable Long babaId) {
    DocumentoVerificacao d=dcr.findByBabaId(babaId)
      .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado."));
    if (!"PENDENTE".equals(d.getStatus())) throw new IllegalArgumentException("Este documento já foi analisado.");
    d.setStatus("APROVADO"); d.setMotivoReprovacao(null); dcr.save(d);
    return Map.of("babaId",babaId,"documentoStatus","APROVADO","status","AGUARDANDO_VERIFICACAO_DA_BABA");
  }

  @PostMapping("/documentos/{babaId}/reprovar")
  public Map<String,Object> reprovarDocumento(@PathVariable Long babaId, @RequestBody Map<String,String> corpo) {
    String motivo=corpo == null ? null : corpo.get("motivo");
    if (motivo == null || motivo.isBlank()) throw new IllegalArgumentException("Informe o motivo da reprovação.");
    DocumentoVerificacao d=dcr.findByBabaId(babaId)
      .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado."));
    if (!"PENDENTE".equals(d.getStatus())) throw new IllegalArgumentException("Este documento já foi analisado.");
    d.setStatus("REPROVADO"); d.setMotivoReprovacao(motivo.trim()); dcr.save(d);
    Baba b=d.getBaba(); b.setVerificada(false); b.setStatusVerificacao("PENDENTE"); b.setMotivoVerificacao(null); br.save(b);
    return Map.of("babaId",babaId,"documentoStatus","REPROVADO","motivo",motivo.trim());
  }

  @GetMapping("/babas")
  public List<Map<String,Object>> babas() {
    return br.findAll().stream().sorted(Comparator.comparing((Baba b) -> b.getUsuario().getNome(), String.CASE_INSENSITIVE_ORDER))
      .map(b -> { Map<String,Object> m=new LinkedHashMap<>(); Usuario u=b.getUsuario();
        m.put("id",b.getId()); m.put("nome",u.getNome()); m.put("email",u.getEmail());
        m.put("telefone",u.getTelefone()); m.put("dataNascimento",u.getDataNascimento());
        m.put("cidade",u.getCidade()); m.put("estado",u.getEstado()); m.put("descricao",b.getDescricao());
        m.put("experienciaAnos",b.getExperienciaAnos()); m.put("valorHora",b.getValorHora());
        m.put("disponibilidade",b.getDisponibilidade()); m.put("verificada",Boolean.TRUE.equals(b.getVerificada()));
        m.put("statusVerificacao", statusBaba(b)); m.put("motivoVerificacao",b.getMotivoVerificacao());
        DocumentoVerificacao doc=dcr.findByBabaId(b.getId()).orElse(null);
        m.put("documentoTipo",doc == null ? null : doc.getTipo());
        m.put("documentoStatus",doc == null ? "NAO_ENVIADO" : doc.getStatus());
        m.put("motivoDocumento",doc == null ? null : doc.getMotivoReprovacao()); return m;
      }).toList();
  }

  @PostMapping("/babas/{babaId}/aprovar")
  public Map<String,Object> aprovarBaba(@PathVariable Long babaId) {
    Baba b=br.findById(babaId).orElseThrow(() -> new IllegalArgumentException("Babá não encontrada."));
    DocumentoVerificacao doc=dcr.findByBabaId(babaId)
      .orElseThrow(() -> new IllegalArgumentException("A babá ainda não enviou o documento obrigatório."));
    if (!"APROVADO".equals(doc.getStatus())) throw new IllegalArgumentException("Aprove o documento obrigatório antes de verificar a babá.");
    b.setVerificada(true); b.setStatusVerificacao("VERIFICADA"); b.setMotivoVerificacao(null); br.save(b);
    return Map.of("babaId",babaId,"statusVerificacao","VERIFICADA");
  }

  @PostMapping("/babas/{babaId}/reprovar")
  public Map<String,Object> reprovarBaba(@PathVariable Long babaId, @RequestBody Map<String,String> corpo) {
    String motivo=corpo == null ? null : corpo.get("motivo");
    if (motivo == null || motivo.isBlank()) throw new IllegalArgumentException("Informe o motivo da reprovação.");
    Baba b=br.findById(babaId).orElseThrow(() -> new IllegalArgumentException("Babá não encontrada."));
    b.setVerificada(false); b.setStatusVerificacao("REPROVADA"); b.setMotivoVerificacao(motivo.trim()); br.save(b);
    return Map.of("babaId",babaId,"statusVerificacao","REPROVADA","motivo",motivo.trim());
  }

  private String statusBaba(Baba b) {
    if (Boolean.TRUE.equals(b.getVerificada())) return "VERIFICADA";
    if ("REPROVADA".equals(b.getStatusVerificacao())) return "REPROVADA";
    return "PENDENTE";
  }

  @GetMapping("/usuarios")
  public List<Map<String,Object>> usuarios() {
    return ur.findAll().stream().sorted(Comparator.comparing(Usuario::getNome))
      .map(u -> Map.<String,Object>of("id",u.getId(),"nome",u.getNome(),"email",u.getEmail(),
        "tipo",u.getTipo().name(),"cidade",u.getCidade()==null?"":u.getCidade(),"estado",u.getEstado()==null?"":u.getEstado())).toList();
  }

  @GetMapping("/agendamentos")
  public List<Map<String,Object>> agendamentos() {
    return agr.findAll().stream().sorted(Comparator.comparing(Agendamento::getCriadoEm).reversed()).limit(100)
      .map(g -> Map.<String,Object>of("id",g.getId(),"responsavel",g.getPai().getUsuario().getNome(),
        "baba",g.getBaba().getUsuario().getNome(),"data",g.getDataServico(),"inicio",g.getHoraInicio(),
        "fim",g.getHoraFim(),"status",g.getStatus().name(),"endereco",g.getEndereco())).toList();
  }

  @GetMapping("/denuncias")
  public List<Map<String,Object>> denuncias() {
    return dr.findAll().stream().sorted(Comparator.comparing(Denuncia::getCriadaEm).reversed())
      .map(d -> Map.<String,Object>of("id",d.getId(),"usuario",d.getUsuario().getNome(),"email",d.getUsuario().getEmail(),
        "motivo",d.getMotivo(),"descricao",d.getDescricao()==null?"":d.getDescricao(),"status",d.getStatus(),"criadaEm",d.getCriadaEm())).toList();
  }

  @PatchMapping("/denuncias/{id}/status")
  public Map<String,Object> atualizarDenuncia(@PathVariable Long id,@RequestParam String status) {
    if(!Set.of("EM_ANALISE","RESOLVIDA","ARQUIVADA").contains(status)) throw new IllegalArgumentException("Status inválido.");
    Denuncia d=dr.findById(id).orElseThrow(() -> new IllegalArgumentException("Denúncia não encontrada."));
    d.setStatus(status); dr.save(d); return Map.of("id",id,"status",status);
  }
}
