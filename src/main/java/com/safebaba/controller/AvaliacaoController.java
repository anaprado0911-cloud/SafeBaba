package com.safebaba.controller;

import com.safebaba.dto.AvaliacaoDtos;
import com.safebaba.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {
    private final AvaliacaoService s;

    public AvaliacaoController(AvaliacaoService s) { this.s = s; }

    @PostMapping
    public Map<String, Object> criar(@Valid @RequestBody AvaliacaoDtos.Request r, Authentication a) {
        return s.criar(r, a.getName());
    }

    @GetMapping("/baba/{id}")
    public List<Object> listar(@PathVariable Long id) {
        return s.porBaba(id).stream()
                .map(a -> (Object) Map.of("id", a.getId(), "nota", a.getNota(),
                        "comentario", a.getComentario() == null ? "" : a.getComentario(),
                        "criadoEm", a.getCriadoEm()))
                .toList();
    }
}
