package com.safebaba.config;
import com.safebaba.model.*; import com.safebaba.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.*; import org.springframework.security.crypto.password.PasswordEncoder;
/** Garante a conta de administrador de demonstração, mesmo em banco que já tinha dados. */
@Configuration
public class AdminInitializer {
  @Bean CommandLineRunner seedAdmin(UsuarioRepository ur, PasswordEncoder enc){ return args -> { if(ur.existsByEmailIgnoreCase("admin@demo.com")) return; Usuario u=new Usuario(); u.setNome("Admin Safe Babá"); u.setEmail("admin@demo.com"); u.setSenha(enc.encode("123456")); u.setTelefone("11988880000"); u.setCidade("São Paulo"); u.setEstado("SP"); u.setTipo(TipoUsuario.ADMIN); ur.save(u); }; }
}
