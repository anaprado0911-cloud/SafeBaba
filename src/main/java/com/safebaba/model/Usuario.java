package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="usuarios")
public class Usuario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, length=120) private String nome;
    @Column(nullable=false, unique=true, length=160) private String email;
    @Column(nullable=false, length=30) private String telefone;
    @Column(nullable=false, length=120) private String senha;
    private LocalDate dataNascimento;
    @Column(length=80) private String cidade;
    @Column(length=2) private String estado;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=10) private TipoUsuario tipo;
    @Column(nullable=false) private Boolean ativo=true;
    @Column(nullable=false) private LocalDateTime criadoEm=LocalDateTime.now();

    public Usuario() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNome(){return nome;} public void setNome(String nome){this.nome=nome;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getTelefone(){return telefone;} public void setTelefone(String telefone){this.telefone=telefone;}
    public String getSenha(){return senha;} public void setSenha(String senha){this.senha=senha;}
    public LocalDate getDataNascimento(){return dataNascimento;} public void setDataNascimento(LocalDate v){this.dataNascimento=v;}
    public String getCidade(){return cidade;} public void setCidade(String v){this.cidade=v;}
    public String getEstado(){return estado;} public void setEstado(String v){this.estado=v;}
    public TipoUsuario getTipo(){return tipo;} public void setTipo(TipoUsuario v){this.tipo=v;}
    public Boolean getAtivo(){return ativo;} public void setAtivo(Boolean v){this.ativo=v;}
    public LocalDateTime getCriadoEm(){return criadoEm;} public void setCriadoEm(LocalDateTime v){this.criadoEm=v;}
}
