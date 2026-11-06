package com.safebaba.service;

import com.safebaba.model.*;
import com.safebaba.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

/** Reencaminha solicitações urgentes sem resposta após 90 segundos. */
@Service
public class UrgenciaScheduler {
    private final AgendamentoRepository agendamentos;
    private final BabaRepository babas;
    public UrgenciaScheduler(AgendamentoRepository agendamentos, BabaRepository babas) { this.agendamentos=agendamentos; this.babas=babas; }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void reencaminharExpiradas() {
        LocalDateTime limite = LocalDateTime.now().minusSeconds(90);
        for (Agendamento a : agendamentos.findAll()) {
            if (a.getStatus()!=StatusAgendamento.PENDENTE || a.getObservacoes()==null || !a.getObservacoes().contains("URGENTE")) continue;
            if (a.getCriadoEm()!=null && a.getCriadoEm().isAfter(limite)) continue;
            encaminharProxima(a);
        }
    }

    @Transactional
    public boolean encaminharProxima(Agendamento a) {
        Set<Long> tentadas = new HashSet<>();
        if (a.getObservacoes()!=null) {
            int p=a.getObservacoes().indexOf("TENTADAS=");
            if(p>=0) for(String id:a.getObservacoes().substring(p+9).split(",")) try { tentadas.add(Long.parseLong(id.trim())); } catch(Exception ignored){}
        }
        Baba anterior = a.getBaba();
        tentadas.add(anterior.getId());
        anterior.setDisponivelAgora(true); babas.save(anterior);
        var proxima = babas.findAll().stream()
            .filter(b -> Boolean.TRUE.equals(b.getVerificada()) && Boolean.TRUE.equals(b.getDisponivelAgora()))
            .filter(b -> b.getUsuario()!=null && a.getBaba().getUsuario().getCidade()!=null && b.getUsuario().getCidade()!=null && b.getUsuario().getCidade().equalsIgnoreCase(a.getBaba().getUsuario().getCidade()))
            .filter(b -> !tentadas.contains(b.getId()))
            .sorted(Comparator.comparing(Baba::getNotaMedia, Comparator.nullsLast(Comparator.reverseOrder())))
            .findFirst();
        if(proxima.isEmpty()) { a.setStatus(StatusAgendamento.CANCELADO); a.setObservacoes("URGENTE - Nenhuma outra babá disponível respondeu. TENTADAS="+join(tentadas)); agendamentos.save(a); return false; }
        proxima.get().setDisponivelAgora(false); babas.save(proxima.get());
        a.setBaba(proxima.get());
        a.setCriadoEm(LocalDateTime.now());
        a.setStatus(StatusAgendamento.PENDENTE);
        a.setObservacoes("URGENTE - Solicitação encaminhada automaticamente. TENTADAS="+join(tentadas));
        agendamentos.save(a);
        return true;
    }
    private String join(Set<Long> ids){ return String.join(",", ids.stream().map(String::valueOf).toList()); }
}
