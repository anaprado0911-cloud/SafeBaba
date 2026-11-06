package com.safebaba.controller;

import com.safebaba.service.PaiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pais")
public class PaiController {
    private final PaiService service;
    public PaiController(PaiService service){this.service=service;}
    private void dono(org.springframework.security.core.Authentication a,String email){ if(!a.getName().equalsIgnoreCase(email)&&a.getAuthorities().stream().noneMatch(x->x.getAuthority().equals("ROLE_ADMIN"))) throw new org.springframework.security.access.AccessDeniedException("Acesso negado."); }
    @GetMapping("/{id}")
    public Object buscar(@PathVariable Long id, org.springframework.security.core.Authentication a){var p=service.buscar(id);var u=p.getUsuario();dono(a,u.getEmail());return java.util.Map.of("id",p.getId(),"usuarioId",u.getId(),"nome",u.getNome(),"cidade",u.getCidade(),"estado",u.getEstado(),"endereco",p.getEndereco()==null?"":p.getEndereco());}
    @GetMapping("/usuario/{usuarioId}")
    public Object porUsuario(@PathVariable Long usuarioId, org.springframework.security.core.Authentication a){var p=service.porUsuario(usuarioId);var u=p.getUsuario();dono(a,u.getEmail());return java.util.Map.of("id",p.getId(),"usuarioId",u.getId(),"nome",u.getNome(),"cidade",u.getCidade(),"estado",u.getEstado());}
}
