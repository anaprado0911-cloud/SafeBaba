package com.safebaba.model;

import jakarta.persistence.*;

@Entity @Table(name="experiencias_profissionais")
public class ExperienciaProfissional {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", nullable=false) private Baba baba;
    @Column(nullable=false, length=160) private String empresa;
    @Column(nullable=false, length=180) private String funcao;
    private Integer anos;
    public ExperienciaProfissional(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public String getEmpresa(){return empresa;} public void setEmpresa(String v){empresa=v;}
    public String getFuncao(){return funcao;} public void setFuncao(String v){funcao=v;}
    public Integer getAnos(){return anos;} public void setAnos(Integer v){anos=v;}
}
