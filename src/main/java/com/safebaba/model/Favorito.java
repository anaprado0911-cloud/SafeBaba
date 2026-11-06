package com.safebaba.model;
import jakarta.persistence.*;
@Entity @Table(name="favoritos")
public class Favorito { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; public String email; public Long babaId; }
