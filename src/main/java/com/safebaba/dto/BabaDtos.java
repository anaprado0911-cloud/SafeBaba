package com.safebaba.dto;

import java.math.BigDecimal;

public final class BabaDtos {
    private BabaDtos() {}
    public record Card(Long id, String nome, String cidade, String estado, String descricao, Integer experienciaAnos, BigDecimal valorHora, String disponibilidade, Boolean verificada, BigDecimal notaMedia, Boolean disponivelAgora, Double latitude, Double longitude) {}
}
