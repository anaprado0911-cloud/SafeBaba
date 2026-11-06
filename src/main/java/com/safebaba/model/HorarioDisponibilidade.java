package com.safebaba.model;
import jakarta.persistence.*; import java.time.*;
@Entity @Table(name="horarios_disponibilidade", uniqueConstraints=@UniqueConstraint(columnNames={"baba_id","dia_semana","hora_inicio","hora_fim"}))
public class HorarioDisponibilidade {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="baba_id",nullable=false) private Baba baba;
 @Column(name="dia_semana",nullable=false) private Integer diaSemana;
 @Column(name="hora_inicio",nullable=false) private LocalTime horaInicio;
 @Column(name="hora_fim",nullable=false) private LocalTime horaFim;
 public Long getId(){return id;} public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;} public Integer getDiaSemana(){return diaSemana;} public void setDiaSemana(Integer v){diaSemana=v;} public LocalTime getHoraInicio(){return horaInicio;} public void setHoraInicio(LocalTime v){horaInicio=v;} public LocalTime getHoraFim(){return horaFim;} public void setHoraFim(LocalTime v){horaFim=v;}
}
