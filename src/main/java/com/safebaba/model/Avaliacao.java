package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="avaliacoes")
public class Avaliacao {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", nullable=false) private Baba baba;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="pai_id", nullable=false) private PaiResponsavel pai;
    @OneToOne(fetch=FetchType.LAZY) @JoinColumn(name="agendamento_id", unique=true) private Agendamento agendamento;
    @Column(nullable=false) private Integer nota;
    @Column(length=500) private String comentario;
    private Boolean pontualidade;
    private Boolean comunicacao;
    private Boolean experiencia;
    @Column(nullable=false) private LocalDateTime criadoEm=LocalDateTime.now();
    public Avaliacao(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public PaiResponsavel getPai(){return pai;} public void setPai(PaiResponsavel v){pai=v;}
    public Agendamento getAgendamento(){return agendamento;} public void setAgendamento(Agendamento v){agendamento=v;}
    public Integer getNota(){return nota;} public void setNota(Integer v){nota=v;}
    public String getComentario(){return comentario;} public void setComentario(String v){comentario=v;}
    public Boolean getPontualidade(){return pontualidade;} public void setPontualidade(Boolean v){pontualidade=v;}
    public Boolean getComunicacao(){return comunicacao;} public void setComunicacao(Boolean v){comunicacao=v;}
    public Boolean getExperiencia(){return experiencia;} public void setExperiencia(Boolean v){experiencia=v;}
    public LocalDateTime getCriadoEm(){return criadoEm;} public void setCriadoEm(LocalDateTime v){criadoEm=v;}
}
