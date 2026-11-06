package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name="agendamentos")
public class Agendamento {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="pai_id", nullable=false) private PaiResponsavel pai;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", nullable=false) private Baba baba;
    @Column(nullable=false) private LocalDate dataServico;
    @Column(nullable=false) private LocalTime horaInicio;
    @Column(nullable=false) private LocalTime horaFim;
    @Column(nullable=false, length=180) private String endereco;
    @Column(nullable=false) private Integer quantidadeCriancas;
    @Column(length=500) private String observacoes;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private StatusAgendamento status=StatusAgendamento.PENDENTE;
    @Column(nullable=false) private LocalDateTime criadoEm=LocalDateTime.now();
    public Agendamento(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public PaiResponsavel getPai(){return pai;} public void setPai(PaiResponsavel v){pai=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public LocalDate getDataServico(){return dataServico;} public void setDataServico(LocalDate v){dataServico=v;}
    public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime v){horaInicio=v;}
    public LocalTime getHoraFim(){return horaFim;} public void setHoraFim(LocalTime v){horaFim=v;}
    public String getEndereco(){return endereco;} public void setEndereco(String v){endereco=v;}
    public Integer getQuantidadeCriancas(){return quantidadeCriancas;} public void setQuantidadeCriancas(Integer v){quantidadeCriancas=v;}
    public String getObservacoes(){return observacoes;} public void setObservacoes(String v){observacoes=v;}
    public StatusAgendamento getStatus(){return status;} public void setStatus(StatusAgendamento v){status=v;}
    public LocalDateTime getCriadoEm(){return criadoEm;} public void setCriadoEm(LocalDateTime v){criadoEm=v;}
}
