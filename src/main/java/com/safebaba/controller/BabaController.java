package com.safebaba.controller;

import com.safebaba.dto.BabaDtos;
import com.safebaba.model.Baba;
import com.safebaba.service.BabaService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/babas")
public class BabaController {
    private final BabaService service;
    public BabaController(BabaService service){this.service=service;}

    @GetMapping
    public List<BabaDtos.Card> listar(@RequestParam(required=false) String cidade,
                                      @RequestParam(defaultValue="false") boolean somenteDisponiveis){
        return service.listar(cidade, somenteDisponiveis).stream().map(this::card).toList();
    }

    @GetMapping("/minha-disponibilidade")
    public Disponibilidade minhaDisponibilidade(Authentication auth){
        Baba b=service.buscarPorEmail(auth.getName());
        return new Disponibilidade(Boolean.TRUE.equals(b.getDisponivelAgora()));
    }

    @PatchMapping("/minha-disponibilidade")
    public Disponibilidade alterarDisponibilidade(@RequestBody DisponibilidadeRequest request, Authentication auth){
        if(request == null || request.disponivelAgora() == null) throw new IllegalArgumentException("Informe se está disponível para atendimento imediato.");
        Baba b=service.buscarPorEmail(auth.getName());
        b.setDisponivelAgora(request.disponivelAgora());
        service.salvar(b);
        return new Disponibilidade(Boolean.TRUE.equals(b.getDisponivelAgora()));
    }

    @PatchMapping("/minha-localizacao")
    public Localizacao minhaLocalizacao(@RequestBody LocalizacaoRequest request, Authentication auth){
        if(request==null || request.latitude()==null || request.longitude()==null || request.latitude() < -90 || request.latitude() > 90 || request.longitude() < -180 || request.longitude() > 180) throw new IllegalArgumentException("Coordenadas inválidas.");
        Baba b=service.buscarPorEmail(auth.getName()); b.setLatitude(request.latitude()); b.setLongitude(request.longitude()); service.salvar(b); return new Localizacao(b.getLatitude(),b.getLongitude());
    }

    @GetMapping("/{id}")
    public BabaDtos.Card buscar(@PathVariable Long id){return card(service.buscar(id));}

    private BabaDtos.Card card(Baba b){
        var u=b.getUsuario();
        return new BabaDtos.Card(b.getId(),u.getNome(),u.getCidade(),u.getEstado(),b.getDescricao(),b.getExperienciaAnos(),b.getValorHora(),b.getDisponibilidade(),b.getVerificada(),b.getNotaMedia(),b.getDisponivelAgora(),b.getLatitude(),b.getLongitude());
    }
    public record Disponibilidade(Boolean disponivelAgora) {}
    public record DisponibilidadeRequest(Boolean disponivelAgora) {}
    public record Localizacao(Double latitude, Double longitude) {}
    public record LocalizacaoRequest(Double latitude, Double longitude) {}
}
