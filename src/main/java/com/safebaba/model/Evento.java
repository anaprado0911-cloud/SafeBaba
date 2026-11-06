package com.safebaba.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
/** Linha do tempo do atendimento: CODIGO, CHECKIN, DIARIO, SOS, CHECKOUT. */
@Entity @Table(name="eventos_atendimento")
public class Evento { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public Long agendamentoId; public String tipo; @Column(length=400) public String texto; public String autor; public LocalDateTime criadoEm; }
