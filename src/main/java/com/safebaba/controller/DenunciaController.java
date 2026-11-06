package com.safebaba.controller;

import com.safebaba.dto.DenunciaDtos;
import com.safebaba.model.Denuncia;
import com.safebaba.service.DenunciaService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/denuncias")
public class DenunciaController {
    private final DenunciaService s;

    public DenunciaController(DenunciaService s) { this.s = s; }

    @PostMapping
    public Map<String, Object> criar(@Valid @RequestBody DenunciaDtos.Request r, Authentication a) {
        Denuncia d = s.registrar(a.getName(), r.motivo(), r.descricao());
        return Map.of("id", d.getId(), "status", d.getStatus());
    }
}
