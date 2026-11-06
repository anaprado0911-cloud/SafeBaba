package com.safebaba.dto;

import jakarta.validation.constraints.NotNull;

public final class ConversaDtos {
    private ConversaDtos() {}
    public record Request(@NotNull Long babaId) {}
}
