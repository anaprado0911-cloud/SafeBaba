package com.safebaba.dto;

import jakarta.validation.constraints.*;

public final class MensagemDtos {
    private MensagemDtos() {}
    /** O remetente é o usuário autenticado; não é mais enviado pelo cliente. */
    public record Request(@NotNull Long conversaId, @NotBlank @Size(max = 1000) String conteudo) {}
}
