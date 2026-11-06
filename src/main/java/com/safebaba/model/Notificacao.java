package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="notificacoes")
public class Notificacao {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id", nullable=false) private Usuario usuario;
    @Column(nullable=false, length=180) private String titulo;
    @Column(nullable=false, length=500) private String mensagem;
    private Boolean lida=false;
    @Column(nullable=false) private LocalDateTime criadaEm=LocalDateTime.now();
    public Notificacao(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;}
    public String getTitulo(){return titulo;} public void setTitulo(String v){titulo=v;}
    public String getMensagem(){return mensagem;} public void setMensagem(String v){mensagem=v;}
    public Boolean getLida(){return lida;} public void setLida(Boolean v){lida=v;}
    public LocalDateTime getCriadaEm(){return criadaEm;} public void setCriadaEm(LocalDateTime v){criadaEm=v;}
}
