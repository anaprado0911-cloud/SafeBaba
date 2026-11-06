package com.safebaba.controller;

import com.safebaba.dto.ConversaDtos;
import com.safebaba.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversas")
public class ConversaController {
    private final ChatService s;

    public ConversaController(ChatService s) { this.s = s; }

    @PostMapping
    public Map<String, Object> abrir(@Valid @RequestBody ConversaDtos.Request r, Authentication a) {
        return Map.of("id", s.abrir(a.getName(), r.babaId()), "babaId", r.babaId());
    }

    @GetMapping("/minhas")
    public List<Map<String, Object>> minhas(Authentication a) {
        return s.conversasDaBaba(a.getName());
    }

    @GetMapping("/{id}/mensagens")
    public List<Map<String, Object>> mensagens(@PathVariable Long id, Authentication a) {
        return s.mensagens(id, a.getName());
    }
}
