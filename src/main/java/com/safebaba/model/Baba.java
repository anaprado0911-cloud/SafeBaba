package com.safebaba.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="babas")
public class Baba {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id", unique=true, nullable=false)
    private Usuario usuario;
    @Column(length=500) private String descricao;
    private Integer experienciaAnos;
    @Column(precision=10, scale=2) private BigDecimal valorHora;
    @Column(length=250) private String disponibilidade;
    @Column(nullable=false) private Boolean verificada=false;
    @Column(length=25) private String statusVerificacao="PENDENTE";
    @Column(length=500) private String motivoVerificacao;
    @Column(nullable=true) private Boolean disponivelAgora=false;
    private Double latitude;
    private Double longitude;
    @Column(nullable=false, precision=3, scale=2) private BigDecimal notaMedia=BigDecimal.ZERO;
    public Baba(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;}
    public String getDescricao(){return descricao;} public void setDescricao(String v){descricao=v;}
    public Integer getExperienciaAnos(){return experienciaAnos;} public void setExperienciaAnos(Integer v){experienciaAnos=v;}
    public BigDecimal getValorHora(){return valorHora;} public void setValorHora(BigDecimal v){valorHora=v;}
    public String getDisponibilidade(){return disponibilidade;} public void setDisponibilidade(String v){disponibilidade=v;}
    public Boolean getVerificada(){return verificada;} public void setVerificada(Boolean v){verificada=v;}
    public String getStatusVerificacao(){return statusVerificacao;} public void setStatusVerificacao(String v){statusVerificacao=v;}
    public String getMotivoVerificacao(){return motivoVerificacao;} public void setMotivoVerificacao(String v){motivoVerificacao=v;}
    public Boolean getDisponivelAgora(){return disponivelAgora;} public void setDisponivelAgora(Boolean v){disponivelAgora=v;}
    public Double getLatitude(){return latitude;} public void setLatitude(Double v){latitude=v;}
    public Double getLongitude(){return longitude;} public void setLongitude(Double v){longitude=v;}
    public BigDecimal getNotaMedia(){return notaMedia;} public void setNotaMedia(BigDecimal v){notaMedia=v;}
}
