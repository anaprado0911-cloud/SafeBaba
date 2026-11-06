package com.safebaba.controller;

import com.safebaba.dto.MensagemDtos;
import com.safebaba.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {
    private final ChatService s;

    public MensagemController(ChatService s) { this.s = s; }

    @PostMapping
    public Map<String, Object> enviar(@Valid @RequestBody MensagemDtos.Request r, Authentication a) {
        return s.enviar(r.conversaId(), r.conteudo(), a.getName());
    }
}
