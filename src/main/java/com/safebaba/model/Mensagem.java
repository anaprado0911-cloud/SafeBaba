package com.safebaba.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="mensagens")
public class Mensagem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="conversa_id", nullable=false) private Conversa conversa;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="remetente_id", nullable=false) private Usuario remetente;
    @Column(nullable=false, length=1000) private String conteudo;
    @Column(nullable=false) private LocalDateTime enviadaEm=LocalDateTime.now();
    private Boolean lida=false;
    public Mensagem(){}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Conversa getConversa(){return conversa;} public void setConversa(Conversa v){conversa=v;}
    public Usuario getRemetente(){return remetente;} public void setRemetente(Usuario v){remetente=v;}
    public String getConteudo(){return conteudo;} public void setConteudo(String v){conteudo=v;}
    public LocalDateTime getEnviadaEm(){return enviadaEm;} public void setEnviadaEm(LocalDateTime v){enviadaEm=v;}
    public Boolean getLida(){return lida;} public void setLida(Boolean v){lida=v;}
}
