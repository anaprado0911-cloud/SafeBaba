package com.safebaba.service;

import com.safebaba.dto.AvaliacaoDtos;
import com.safebaba.model.*;
import com.safebaba.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class AvaliacaoService {
    private final AvaliacaoRepository ar;
    private final BabaRepository br;
    private final AgendamentoRepository agr;

    public AvaliacaoService(AvaliacaoRepository ar, BabaRepository br, AgendamentoRepository agr) {
        this.ar = ar; this.br = br; this.agr = agr;
    }

    /** Regras: só o responsável dono do agendamento, só depois de concluído, uma avaliação por atendimento. */
    @Transactional
    public Map<String, Object> criar(AvaliacaoDtos.Request r, String emailLogado) {
        Agendamento ag = agr.findById(r.agendamentoId())
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado."));
        if (!emailLogado.equalsIgnoreCase(ag.getPai().getUsuario().getEmail())) {
            throw new AccessDeniedException("Só o responsável deste atendimento pode avaliar.");
        }
        if (ag.getStatus() != StatusAgendamento.CONCLUIDO) {
            throw new IllegalArgumentException("Só é possível avaliar depois que o atendimento for concluído.");
        }
        if (ar.existsByAgendamentoId(ag.getId())) {
            throw new IllegalArgumentException("Este atendimento já foi avaliado.");
        }
        Avaliacao a = new Avaliacao();
        a.setBaba(ag.getBaba());
        a.setPai(ag.getPai());
        a.setAgendamento(ag);
        a.setNota(r.nota());
        a.setComentario(r.comentario() == null || r.comentario().isBlank() ? null : r.comentario().trim());
        a.setPontualidade(r.pontualidade());
        a.setComunicacao(r.comunicacao());
        a.setExperiencia(r.experiencia());
        a = ar.save(a);
        atualizarNota(ag.getBaba());
        return Map.of("id", a.getId(), "nota", a.getNota());
    }

    private void atualizarNota(Baba b) {
        List<Avaliacao> xs = ar.findByBabaIdOrderByCriadoEmDesc(b.getId());
        double avg = xs.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        b.setNotaMedia(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        br.save(b);
    }

    public List<Avaliacao> porBaba(Long id) { return ar.findByBabaIdOrderByCriadoEmDesc(id); }
}
