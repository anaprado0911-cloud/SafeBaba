package com.safebaba.model;
import jakarta.persistence.*; import java.time.LocalDate; import java.time.LocalDateTime;
@Entity @Table(name="assinaturas_pais")
public class AssinaturaPai {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(optional=false) @JoinColumn(name="pai_id", unique=true, nullable=false) private PaiResponsavel pai;
 @Column(nullable=false,length=30) private String plano="GRATUITO";
 @Column(nullable=false,length=20) private String status="ATIVO";
 @Column(nullable=false) private LocalDate inicio=LocalDate.now();
 @Column private LocalDate fim;
 @Column(nullable=false) private LocalDateTime atualizadoEm=LocalDateTime.now();
 public Long getId(){return id;} public PaiResponsavel getPai(){return pai;} public void setPai(PaiResponsavel p){pai=p;}
 public String getPlano(){return plano;} public void setPlano(String p){plano=p;} public String getStatus(){return status;} public void setStatus(String s){status=s;}
 public LocalDate getInicio(){return inicio;} public void setInicio(LocalDate d){inicio=d;} public LocalDate getFim(){return fim;} public void setFim(LocalDate d){fim=d;}
 public LocalDateTime getAtualizadoEm(){return atualizadoEm;} public void setAtualizadoEm(LocalDateTime d){atualizadoEm=d;}
}
