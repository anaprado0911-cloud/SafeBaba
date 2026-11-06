package com.safebaba.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="pagamentos")
public class Pagamento {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="agendamento_id", unique=true, nullable=false) private Agendamento agendamento;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal valor;
    @Column(nullable=false, length=30) private String status="PENDENTE";
    @Column(nullable=false) private LocalDateTime criadoEm=LocalDateTime.now();
    public Pagamento(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Agendamento getAgendamento(){return agendamento;} public void setAgendamento(Agendamento v){agendamento=v;}
    public BigDecimal getValor(){return valor;} public void setValor(BigDecimal v){valor=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getCriadoEm(){return criadoEm;} public void setCriadoEm(LocalDateTime v){criadoEm=v;}
}
