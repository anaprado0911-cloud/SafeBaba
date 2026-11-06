package com.safebaba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class DenunciaDtos {
    private DenunciaDtos() {}
    public record Request(@NotBlank @Size(max = 500) String motivo, @Size(max = 1000) String descricao) {}
}
