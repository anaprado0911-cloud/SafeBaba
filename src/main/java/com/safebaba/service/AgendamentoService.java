package com.safebaba.service;

import com.safebaba.dto.AgendamentoDtos;
import com.safebaba.model.Agendamento;
import com.safebaba.model.AssinaturaPai;
import com.safebaba.model.Baba;
import com.safebaba.model.PaiResponsavel;
import com.safebaba.model.StatusAgendamento;
import com.safebaba.repository.AgendamentoRepository;
import com.safebaba.repository.AssinaturaPaiRepository;
import com.safebaba.repository.BabaRepository;
import com.safebaba.repository.PaiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

/**
 * Regras de negócio dos agendamentos do SafeBabá.
 * A autorização do usuário é conferida no controller; aqui ficam as
 * validações de data, disponibilidade, conflito de horários e plano.
 */
@Service
@Transactional(readOnly = true)
public class AgendamentoService {

    private static final List<StatusAgendamento> STATUS_QUE_OCUPAM_HORARIO =
            List.of(StatusAgendamento.PENDENTE, StatusAgendamento.ACEITO);

    private final AgendamentoRepository agendamentos;
    private final PaiRepository pais;
    private final BabaRepository babas;
    private final AgendaDisponibilidadeService disponibilidade;
    private final AssinaturaPaiRepository assinaturas;

    public AgendamentoService(
            AgendamentoRepository agendamentos,
            PaiRepository pais,
            BabaRepository babas,
            AgendaDisponibilidadeService disponibilidade,
            AssinaturaPaiRepository assinaturas) {
        this.agendamentos = agendamentos;
        this.pais = pais;
        this.babas = babas;
        this.disponibilidade = disponibilidade;
        this.assinaturas = assinaturas;
    }

    @Transactional
    public Agendamento criar(AgendamentoDtos.Request request) {
        validarDados(request);

        LocalDate hoje = LocalDate.now();
        if (request.dataServico().isBefore(hoje)) {
            throw new IllegalArgumentException("Não é possível agendar em uma data passada.");
        }

        PaiResponsavel pai = pais.findById(request.paiId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil de responsável não encontrado."));

        Baba baba = babas.findById(request.babaId())
                .orElseThrow(() -> new IllegalArgumentException("Babá não encontrada."));

        validarLimiteDoPlano(pai);
        disponibilidade.validarAgendamento(
                baba.getId(), request.dataServico(), request.horaInicio(), request.horaFim());
        validarConflitoDeHorario(baba.getId(), request.dataServico(),
                request.horaInicio(), request.horaFim());

        Agendamento agendamento = new Agendamento();
        agendamento.setPai(pai);
        agendamento.setBaba(baba);
        agendamento.setDataServico(request.dataServico());
        agendamento.setHoraInicio(request.horaInicio());
        agendamento.setHoraFim(request.horaFim());
        agendamento.setEndereco(request.endereco().trim());
        agendamento.setQuantidadeCriancas(request.quantidadeCriancas());
        agendamento.setObservacoes(limparObservacoes(request.observacoes()));

        return agendamentos.save(agendamento);
    }

    private void validarDados(AgendamentoDtos.Request request) {
        if (request == null) {
            throw new IllegalArgumentException("Os dados do agendamento não foram informados.");
        }
        if (request.paiId() == null || request.babaId() == null
                || request.dataServico() == null || request.horaInicio() == null
                || request.horaFim() == null) {
            throw new IllegalArgumentException("Preencha todos os dados obrigatórios do agendamento.");
        }
        if (!request.horaFim().isAfter(request.horaInicio())) {
            throw new IllegalArgumentException("O horário final deve ser posterior ao horário inicial.");
        }
        if (request.endereco() == null || request.endereco().isBlank()) {
            throw new IllegalArgumentException("Informe o endereço do atendimento.");
        }
        if (request.quantidadeCriancas() == null || request.quantidadeCriancas() < 1) {
            throw new IllegalArgumentException("Informe pelo menos uma criança.");
        }
    }

    private void validarLimiteDoPlano(PaiResponsavel pai) {
        AssinaturaPai assinatura = assinaturas.findByPaiId(pai.getId()).orElse(null);
        String plano = assinatura == null || assinatura.getPlano() == null
                ? "GRATUITO"
                : assinatura.getPlano().trim().toUpperCase(Locale.ROOT);

        // Assinaturas inativas ou vencidas não mantêm benefícios pagos.
        if (assinatura != null && (!"ATIVO".equalsIgnoreCase(assinatura.getStatus())
                || (assinatura.getFim() != null && assinatura.getFim().isBefore(LocalDate.now())))) {
            plano = "GRATUITO";
        }

        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
        LocalDate fimMes = inicioMes.plusMonths(1).minusDays(1);
        long quantidadeNoMes = agendamentos.countByPaiIdAndDataServicoBetween(
                pai.getId(), inicioMes, fimMes);

        if ("GRATUITO".equals(plano)) {
            boolean possuiAtivo = agendamentos.findByPaiIdOrderByDataServicoDesc(pai.getId())
                    .stream()
                    .anyMatch(a -> STATUS_QUE_OCUPAM_HORARIO.contains(a.getStatus()));
            if (possuiAtivo) {
                throw new IllegalArgumentException(
                        "O plano Gratuito permite apenas 1 agendamento ativo por vez. Conheça os planos Família.");
            }
            return;
        }

        long limite = switch (plano) {
            case "FAMILIA" -> 5;
            case "FAMILIA+" , "FAMILIA_PLUS", "FAMILIAMAIS" -> 10;
            default -> 1;
        };

        if (quantidadeNoMes >= limite) {
            throw new IllegalArgumentException(
                    "Você atingiu o limite de " + limite + " agendamentos do seu plano neste mês.");
        }
    }

    private void validarConflitoDeHorario(Long babaId, LocalDate data,
                                           java.time.LocalTime inicio, java.time.LocalTime fim) {
        boolean conflito = agendamentos
                .findByBabaIdAndDataServicoAndStatusIn(babaId, data, STATUS_QUE_OCUPAM_HORARIO)
                .stream()
                .anyMatch(existente -> inicio.isBefore(existente.getHoraFim())
                        && fim.isAfter(existente.getHoraInicio()));

        if (conflito) {
            throw new IllegalArgumentException(
                    "A babá já possui um atendimento solicitado ou confirmado nesse horário. Escolha outro período.");
        }
    }

    private String limparObservacoes(String observacoes) {
        if (observacoes == null || observacoes.isBlank()) {
            return null;
        }
        String texto = observacoes.trim();
        if (texto.length() > 500) {
            throw new IllegalArgumentException("As observações devem ter no máximo 500 caracteres.");
        }
        return texto;
    }

    public List<Agendamento> porPai(Long paiId) {
        return agendamentos.findByPaiIdOrderByDataServicoDesc(paiId);
    }

    public List<Agendamento> porBaba(Long babaId) {
        return agendamentos.findByBabaIdOrderByDataServicoDesc(babaId);
    }

    @Transactional
    public Agendamento status(Long id, StatusAgendamento novoStatus) {
        Agendamento agendamento = agendamentos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento não encontrado."));

        if (novoStatus == null) {
            throw new IllegalArgumentException("Informe o novo status do agendamento.");
        }

        StatusAgendamento atual = agendamento.getStatus();
        boolean transicaoValida = switch (atual) {
            case PENDENTE -> novoStatus == StatusAgendamento.ACEITO
                    || novoStatus == StatusAgendamento.RECUSADO
                    || novoStatus == StatusAgendamento.CANCELADO;
            case ACEITO -> novoStatus == StatusAgendamento.CONCLUIDO
                    || novoStatus == StatusAgendamento.CANCELADO;
            case RECUSADO, CONCLUIDO, CANCELADO -> false;
        };

        if (!transicaoValida) {
            throw new IllegalArgumentException(
                    "Não é possível alterar o agendamento de " + atual + " para " + novoStatus + ".");
        }

        agendamento.setStatus(novoStatus);
        return agendamentos.save(agendamento);
    }
}
