package com.safebaba.dto;
import com.safebaba.model.StatusAgendamento;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
public final class AgendamentoDtos {
    private AgendamentoDtos(){}
    public record Request(@NotNull Long paiId,@NotNull Long babaId,@NotNull LocalDate dataServico,@NotNull LocalTime horaInicio,@NotNull LocalTime horaFim,@NotBlank String endereco,@NotNull @Min(1) Integer quantidadeCriancas,String observacoes){}
    public record Response(Long id, Long paiId, Long babaId, String babaNome, LocalDate dataServico, LocalTime horaInicio, LocalTime horaFim, String endereco, Integer quantidadeCriancas, String observacoes, StatusAgendamento status){}
}
