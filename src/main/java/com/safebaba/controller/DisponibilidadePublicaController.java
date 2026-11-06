package com.safebaba.controller;

import com.safebaba.model.StatusAgendamento;
import com.safebaba.repository.BabaRepository;
import com.safebaba.repository.BloqueioAgendaRepository;
import com.safebaba.repository.AgendamentoRepository;
import com.safebaba.repository.HorarioDisponibilidadeRepository;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/babas")
public class DisponibilidadePublicaController {
    private final BabaRepository babas;
    private final HorarioDisponibilidadeRepository horarios;
    private final BloqueioAgendaRepository bloqueios;
    private final AgendamentoRepository agendamentos;

    public DisponibilidadePublicaController(BabaRepository babas, HorarioDisponibilidadeRepository horarios,
            BloqueioAgendaRepository bloqueios, AgendamentoRepository agendamentos) {
        this.babas = babas; this.horarios = horarios; this.bloqueios = bloqueios; this.agendamentos = agendamentos;
    }

    @GetMapping("/{id}/disponibilidade")
    public Map<String,Object> consultar(@PathVariable Long id, @RequestParam LocalDate inicio, @RequestParam LocalDate fim) {
        if (!babas.existsById(id)) throw new IllegalArgumentException("Babá não encontrada.");
        if (inicio == null || fim == null || inicio.isBefore(LocalDate.now()) || fim.isBefore(inicio) || fim.isAfter(inicio.plusDays(30)))
            throw new IllegalArgumentException("Informe um período futuro de até 30 dias.");
        var semana = horarios.findByBabaIdOrderByDiaSemanaAscHoraInicioAsc(id).stream().map(h -> Map.<String,Object>of(
            "diaSemana", h.getDiaSemana(), "inicio", h.getHoraInicio().toString(), "fim", h.getHoraFim().toString())).toList();
        var folgas = bloqueios.findByBabaIdAndInicioBetweenOrderByInicioAsc(id, inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay()).stream().map(b -> Map.<String,Object>of(
            "inicio", b.getInicio().toString(), "fim", b.getFim().toString())).toList();
        var ocupados = agendamentos.findByBabaIdAndDataServicoBetweenAndStatusIn(id, inicio, fim, List.of(StatusAgendamento.PENDENTE, StatusAgendamento.ACEITO)).stream().map(a -> Map.<String,Object>of(
            "data", a.getDataServico().toString(), "inicio", a.getHoraInicio().toString(), "fim", a.getHoraFim().toString())).toList();
        return Map.of("horarios", semana, "bloqueios", folgas, "ocupados", ocupados);
    }
}
