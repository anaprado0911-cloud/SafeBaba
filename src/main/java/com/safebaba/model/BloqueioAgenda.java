package com.safebaba.model;
import jakarta.persistence.*; import java.time.*;
@Entity @Table(name="bloqueios_agenda")
public class BloqueioAgenda {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="baba_id",nullable=false) private Baba baba;
 @Column(name="inicio",nullable=false) private LocalDateTime inicio;
 @Column(name="fim",nullable=false) private LocalDateTime fim;
 @Column(length=180) private String motivo;
 public Long getId(){return id;} public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;} public LocalDateTime getInicio(){return inicio;} public void setInicio(LocalDateTime v){inicio=v;} public LocalDateTime getFim(){return fim;} public void setFim(LocalDateTime v){fim=v;} public String getMotivo(){return motivo;} public void setMotivo(String v){motivo=v;}
}
