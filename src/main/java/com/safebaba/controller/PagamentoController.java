package com.safebaba.controller;
import com.safebaba.service.PagamentoService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {
    private final PagamentoService service;
    public PagamentoController(PagamentoService service) { this.service = service; }
    @GetMapping
    public List<Map<String, Object>> meusPagamentos(Principal usuario) {
        return service.meusPagamentos(usuario);
    }
}
