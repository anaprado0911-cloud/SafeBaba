package com.safebaba.model;

import jakarta.persistence.*;

@Entity
@Table(name="documentos_verificacao")
public class DocumentoVerificacao {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="baba_id", unique=true, nullable=false) private Baba baba;
    @Column(nullable=false, length=40) private String tipo;
    @Column(nullable=false, length=25) private String status="PENDENTE";
    @Column(length=500) private String motivoReprovacao;
    @Column(length=180) private String arquivoNome;
    @Column(length=120) private String arquivoTipo;
    @Lob @Column(name="arquivo_dados") private byte[] arquivoDados;

    public DocumentoVerificacao(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Baba getBaba(){return baba;} public void setBaba(Baba v){baba=v;}
    public String getTipo(){return tipo;} public void setTipo(String v){tipo=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public String getMotivoReprovacao(){return motivoReprovacao;} public void setMotivoReprovacao(String v){motivoReprovacao=v;}
    public String getArquivoNome(){return arquivoNome;} public void setArquivoNome(String v){arquivoNome=v;}
    public String getArquivoTipo(){return arquivoTipo;} public void setArquivoTipo(String v){arquivoTipo=v;}
    public byte[] getArquivoDados(){return arquivoDados;} public void setArquivoDados(byte[] v){arquivoDados=v;}
}
