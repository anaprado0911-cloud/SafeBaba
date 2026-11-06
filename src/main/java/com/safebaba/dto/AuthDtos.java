package com.safebaba.dto;

import com.safebaba.model.TipoUsuario;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegistroRequest(
        @NotBlank String nome,
        @Email @NotBlank String email,
        @NotBlank @Size(min=8, message="deve ter pelo menos 8 caracteres") @Pattern(regexp="^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$", message="deve conter letra maiúscula, letra minúscula e número") String senha,
        @NotBlank String telefone,
        LocalDate dataNascimento,
        @NotBlank String cidade,
        @NotBlank @Size(min=2,max=2) String estado,
        @NotNull TipoUsuario tipo,
        String descricao,
        Integer experienciaAnos,
        BigDecimal valorHora,
        String disponibilidade
    ) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String senha) {}
    public record AuthResponse(String token, Long id, String nome, String email, TipoUsuario tipo, String mensagem) {}
}
