package com.safebaba.service;

import com.safebaba.model.Agendamento;
import com.safebaba.model.Pagamento;
import com.safebaba.repository.AgendamentoRepository;
import com.safebaba.repository.PagamentoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagamentoService {
    private final PagamentoRepository pagamentos;
    private final AgendamentoRepository agendamentos;

    public PagamentoService(PagamentoRepository pagamentos, AgendamentoRepository agendamentos) {
        this.pagamentos = pagamentos;
        this.agendamentos = agendamentos;
    }

    @Transactional
    public Map<String, Object> pagar(Long agendamentoId, Principal usuario) {
        Agendamento agendamento = agendamentos.findById(agendamentoId)
            .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado."));
        if (!ehResponsavel(agendamento, usuario.getName())) {
            throw new AccessDeniedException("Somente o responsável pode realizar o pagamento.");
        }
        if (pagamentos.existsByAgendamentoId(agendamentoId)) {
            throw new IllegalArgumentException("Este agendamento já possui um pagamento registrado.");
        }

        long minutos = Duration.between(agendamento.getHoraInicio(), agendamento.getHoraFim()).toMinutes();
        if (minutos <= 0) throw new IllegalArgumentException("O horário do agendamento é inválido.");
        BigDecimal valorHora = agendamento.getBaba().getValorHora();
        if (valorHora == null || valorHora.signum() <= 0) {
            throw new IllegalArgumentException("A babá não possui um valor por hora válido.");
        }
        BigDecimal valor = valorHora.multiply(BigDecimal.valueOf(minutos))
            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        Pagamento pagamento = new Pagamento();
        pagamento.setAgendamento(agendamento);
        pagamento.setValor(valor);
        pagamento.setStatus("RETIDO");
        pagamentos.save(pagamento);
        return paraResposta(pagamento);
    }

    @Transactional
    public void liberarSeRetido(Long agendamentoId) {
        pagamentos.findByAgendamentoId(agendamentoId).ifPresent(p -> {
            if ("RETIDO".equals(p.getStatus())) {
                p.setStatus("LIBERADO");
                pagamentos.save(p);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> meusPagamentos(Principal usuario) {
        String email = usuario.getName();
        return pagamentos.findAllByOrderByCriadoEmDesc().stream()
            .filter(p -> ehResponsavel(p.getAgendamento(), email) || ehBaba(p.getAgendamento(), email))
            .map(this::paraResposta).toList();
    }

    private boolean ehResponsavel(Agendamento a, String email) {
        return a.getPai().getUsuario().getEmail().equalsIgnoreCase(email);
    }
    private boolean ehBaba(Agendamento a, String email) {
        return a.getBaba().getUsuario().getEmail().equalsIgnoreCase(email);
    }
    private Map<String, Object> paraResposta(Pagamento p) {
        Agendamento a = p.getAgendamento();
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", p.getId());
        r.put("agendamentoId", a.getId());
        r.put("valor", p.getValor());
        r.put("status", p.getStatus());
        r.put("criadoEm", p.getCriadoEm());
        r.put("dataServico", a.getDataServico());
        r.put("horaInicio", a.getHoraInicio());
        r.put("horaFim", a.getHoraFim());
        r.put("babaNome", a.getBaba().getUsuario().getNome());
        r.put("responsavelNome", a.getPai().getUsuario().getNome());
        return r;
    }
}
