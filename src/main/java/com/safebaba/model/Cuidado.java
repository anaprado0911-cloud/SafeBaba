package com.safebaba.model;
import jakarta.persistence.*;
/** Cartão de cuidados de uma criança; pertence ao responsável (e-mail). */
@Entity @Table(name="cuidados")
public class Cuidado { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public String email, nome, alergias, remedios, rotina, pediatra, contato; public Integer idade; }
