package com.safebaba.service;
import com.safebaba.model.Usuario;
import com.safebaba.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
@Service
public class UsuarioService {
  private final UsuarioRepository repo; private final PasswordEncoder encoder;
  public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder){this.repo=repo;this.encoder=encoder;}
  public Usuario salvar(Usuario u){ if(repo.existsByEmailIgnoreCase(u.getEmail())) throw new IllegalArgumentException("E-mail já cadastrado."); u.setSenha(encoder.encode(u.getSenha())); return repo.save(u); }
  public Usuario buscar(Long id){ return repo.findById(id).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado.")); }
  public Usuario porEmail(String email){return repo.findByEmailIgnoreCase(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado."));}
}
