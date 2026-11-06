package com.safebaba.dto;

import jakarta.validation.constraints.*;

public final class AvaliacaoDtos {
    private AvaliacaoDtos() {}
    /** Babá e responsável são deduzidos do agendamento; o cliente só informa a nota. */
    public record Request(@NotNull Long agendamentoId, @NotNull @Min(1) @Max(5) Integer nota,
                          @Size(max = 500) String comentario,
                          Boolean pontualidade, Boolean comunicacao, Boolean experiencia) {}
}
