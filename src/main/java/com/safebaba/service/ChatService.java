package com.safebaba.service;

import com.safebaba.model.*;
import com.safebaba.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safebaba.realtime.ChatWebSocketHandler;

@Service
public class ChatService {
    private final ConversaRepository cr;
    private final MensagemRepository mr;
    private final UsuarioService us;
    private final PaiRepository pr;
    private final BabaRepository br;
    private final ChatWebSocketHandler realtime;
    private final ObjectMapper mapper;

    public ChatService(ConversaRepository cr, MensagemRepository mr, UsuarioService us, PaiRepository pr, BabaRepository br, ChatWebSocketHandler realtime, ObjectMapper mapper) {
        this.cr = cr; this.mr = mr; this.us = us; this.pr = pr; this.br = br; this.realtime = realtime; this.mapper = mapper;
    }

    /** Só o responsável abre a conversa, e sempre em seu próprio nome. Reaproveita a conversa existente. */
    @Transactional
    public Long abrir(String email, Long babaId) {
        Usuario u = us.porEmail(email);
        if (u.getTipo() != TipoUsuario.PAI) throw new AccessDeniedException("Só o responsável inicia a conversa.");
        PaiResponsavel pai = pr.findByUsuarioId(u.getId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil de responsável não encontrado."));
        Baba baba = br.findById(babaId).orElseThrow(() -> new IllegalArgumentException("Babá não encontrada."));
        return cr.findByPaiIdAndBabaId(pai.getId(), baba.getId())
                .orElseGet(() -> {
                    Conversa c = new Conversa();
                    c.setPai(pai);
                    c.setBaba(baba);
                    return cr.save(c);
                }).getId();
    }

    private Conversa participante(Long conversaId, String email) {
        Conversa c = cr.findById(conversaId).orElseThrow(() -> new IllegalArgumentException("Conversa não encontrada."));
        boolean ok = email.equalsIgnoreCase(c.getPai().getUsuario().getEmail())
                || email.equalsIgnoreCase(c.getBaba().getUsuario().getEmail());
        if (!ok) throw new AccessDeniedException("Acesso negado.");
        return c;
    }

    @Transactional
    public List<Map<String, Object>> mensagens(Long conversaId, String email) {
        Conversa c = participante(conversaId, email);
        Usuario atual = us.porEmail(email);
        List<Mensagem> lista = mr.findByConversaIdOrderByEnviadaEmAsc(conversaId);
        for (Mensagem mensagem : lista) {
            if (!mensagem.getRemetente().getId().equals(atual.getId())) {
                mensagem.setLida(true);
            }
        }
        return lista.stream()
                .map(m -> Map.<String, Object>of(
                        "id", m.getId(),
                        "conteudo", m.getConteudo(),
                        "remetente", m.getRemetente().getNome(),
                        "enviadaEm", m.getEnviadaEm(),
                        "lida", Boolean.TRUE.equals(m.getLida())))
                .toList();
    }

    /** Caixa de entrada exclusiva da babá autenticada. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> conversasDaBaba(String email) {
        Usuario usuario = us.porEmail(email);
        if (usuario.getTipo() != TipoUsuario.BABA) {
            throw new AccessDeniedException("Apenas babás podem consultar esta caixa de entrada.");
        }
        Baba baba = br.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil de babá não encontrado."));

        return cr.findAllByBabaIdOrderByCriadaEmDesc(baba.getId()).stream().map(c -> {
            List<Mensagem> ultima = mr.findTop1ByConversaIdOrderByEnviadaEmDesc(c.getId());
            long naoLidas = mr.countByConversaIdAndLidaFalseAndRemetenteIdNot(c.getId(), usuario.getId());
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", c.getId());
            item.put("responsavel", c.getPai().getUsuario().getNome());
            item.put("responsavelEmail", c.getPai().getUsuario().getEmail());
            item.put("ultimaMensagem", ultima.isEmpty() ? "" : ultima.get(0).getConteudo());
            item.put("ultimaMensagemEm", ultima.isEmpty() ? c.getCriadaEm() : ultima.get(0).getEnviadaEm());
            item.put("naoLidas", naoLidas);
            return item;
        }).toList();
    }

    @Transactional
    public Map<String, Object> enviar(Long conversaId, String conteudo, String email) {
        Conversa c = participante(conversaId, email);
        Mensagem m = new Mensagem();
        m.setConversa(c);
        m.setRemetente(us.porEmail(email));
        m.setConteudo(conteudo.trim());
        m = mr.save(m);
        Map<String,Object> payload = Map.of("tipo","mensagem","id",m.getId(),"conteudo",m.getConteudo(),"remetente",m.getRemetente().getNome(),"enviadaEm",m.getEnviadaEm());
        try { realtime.publicar(conversaId, mapper.writeValueAsString(payload)); } catch (Exception ignored) { }
        return Map.of("id", m.getId(), "conteudo", m.getConteudo(), "enviadaEm", m.getEnviadaEm());
    }
}
