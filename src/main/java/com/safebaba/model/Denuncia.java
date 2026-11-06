package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="denuncias")
public class Denuncia {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id", nullable=false) private Usuario usuario;
    @Column(nullable=false, length=500) private String motivo;
    @Column(length=1000) private String descricao;
    @Column(nullable=false, length=25) private String status="ABERTA";
    @Column(nullable=false) private LocalDateTime criadaEm=LocalDateTime.now();
    public Denuncia(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;}
    public String getMotivo(){return motivo;} public void setMotivo(String v){motivo=v;}
    public String getDescricao(){return descricao;} public void setDescricao(String v){descricao=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getCriadaEm(){return criadaEm;} public void setCriadaEm(LocalDateTime v){criadaEm=v;}
}
