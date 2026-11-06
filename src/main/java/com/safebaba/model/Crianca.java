package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name="criancas")
public class Crianca {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="pai_id", nullable=false) private PaiResponsavel pai;
    @Column(nullable=false, length=120) private String nome;
    private LocalDate dataNascimento;
    @Column(length=500) private String observacoes;
    public Crianca(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public PaiResponsavel getPai(){return pai;} public void setPai(PaiResponsavel v){pai=v;}
    public String getNome(){return nome;} public void setNome(String v){nome=v;}
    public LocalDate getDataNascimento(){return dataNascimento;} public void setDataNascimento(LocalDate v){dataNascimento=v;}
    public String getObservacoes(){return observacoes;} public void setObservacoes(String v){observacoes=v;}
}
