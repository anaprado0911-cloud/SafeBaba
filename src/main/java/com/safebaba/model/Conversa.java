package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="conversas")
public class Conversa {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="pai_id", nullable=false) private PaiResponsavel pai;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", nullable=false) private Baba baba;
    @Column(nullable=false) private LocalDateTime criadaEm=LocalDateTime.now();
    public Conversa(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public PaiResponsavel getPai(){return pai;} public void setPai(PaiResponsavel v){pai=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public LocalDateTime getCriadaEm(){return criadaEm;} public void setCriadaEm(LocalDateTime v){criadaEm=v;}
}
