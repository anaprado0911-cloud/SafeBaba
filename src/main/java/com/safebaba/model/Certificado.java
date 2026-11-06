package com.safebaba.model;

import jakarta.persistence.*;

@Entity @Table(name="certificados")
public class Certificado {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", nullable=false) private Baba baba;
    @Column(nullable=false, length=180) private String nome;
    @Column(length=180) private String instituicao;
    private Integer ano;
    public Certificado(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public String getNome(){return nome;} public void setNome(String v){nome=v;}
    public String getInstituicao(){return instituicao;} public void setInstituicao(String v){instituicao=v;}
    public Integer getAno(){return ano;} public void setAno(Integer v){ano=v;}
}
