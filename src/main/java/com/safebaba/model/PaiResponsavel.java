package com.safebaba.model;

import jakarta.persistence.*;

@Entity
@Table(name="pais_responsaveis")
public class PaiResponsavel {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id", unique=true, nullable=false)
    private Usuario usuario;
    @Column(length=180) private String endereco;
    public PaiResponsavel(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;}
    public String getEndereco(){return endereco;} public void setEndereco(String v){endereco=v;}
}
