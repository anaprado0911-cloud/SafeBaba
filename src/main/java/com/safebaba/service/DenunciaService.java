package com.safebaba.service;

import com.safebaba.model.Denuncia;
import com.safebaba.repository.DenunciaRepository;
import org.springframework.stereotype.Service;

@Service
public class DenunciaService {
    private final DenunciaRepository repo;
    private final UsuarioService usuarios;

    public DenunciaService(DenunciaRepository repo, UsuarioService usuarios) {
        this.repo = repo;
        this.usuarios = usuarios;
    }

    /** O autor é sempre o usuário autenticado; status e data não vêm do cliente. */
    public Denuncia registrar(String emailAutor, String motivo, String descricao) {
        Denuncia d = new Denuncia();
        d.setUsuario(usuarios.porEmail(emailAutor));
        d.setMotivo(motivo.trim());
        d.setDescricao(descricao == null || descricao.isBlank() ? null : descricao.trim());
        return repo.save(d);
    }
}
