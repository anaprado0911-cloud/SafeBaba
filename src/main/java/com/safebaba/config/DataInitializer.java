package com.safebaba.config;
import com.safebaba.model.*;
import com.safebaba.repository.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Carga opcional de dados fictícios para desenvolvimento/demonstração. */
@Configuration
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataInitializer {
  private static final String[] COMENT={"Chegou no horário e as crianças adoraram.","Comunicação clara durante todo o atendimento.","Atenciosa e organizada, vou contratar de novo.","Segura e paciente com meu filho de 3 anos.","Profissional e carinhosa."};
  @Bean
  CommandLineRunner seed(UsuarioRepository ur, PaiRepository pr, BabaRepository br, AvaliacaoRepository ar, DocumentoVerificacaoRepository dr, CertificadoRepository cr, AgendamentoRepository agr, PasswordEncoder enc){
    return args -> {
      if(ur.count()>0) { seedBabasAdicionais(ur, pr, br, dr, enc); return; }
      String hash=enc.encode("123456");
      List<PaiResponsavel> pais=new ArrayList<>();
      String[][] fam={{"Mariana Souza","pai@demo.com","Osasco"},{"Rafael Costa","rafael@demo.com","São Paulo"},{"Juliana Prado","juliana@demo.com","Campinas"}};
      for(String[] f:fam){ Usuario u=novo(f[0],f[1],f[2],TipoUsuario.PAI,hash); ur.save(u); PaiResponsavel p=new PaiResponsavel(); p.setUsuario(u); p.setEndereco("Rua das Flores, 120, "+f[2]); pais.add(pr.save(p)); }
      // nome, e-mail, cidade, anos, valor/h, status do documento, nº de certificados, notas recebidas
      String[][] bs={{"Ana Clara","ana@demo.com","São Paulo","3","65","APROVADO","1","5,5,4"},{"Beatriz Lima","bia@demo.com","São Paulo","5","75","APROVADO","2","5,5,5,4,5"},{"Carolina Alves","carol@demo.com","Campinas","4","70","APROVADO","1","5,4,5"},{"Diana Martins","diana@demo.com","Santos","2","60","PENDENTE","0","4"},{"Elisa Ramos","elisa@demo.com","São Paulo","7","90","APROVADO","2","5,5,5,5,4,5,5"},{"Elisa Martins","elisa.osasco@demo.com","Osasco","4","35","APROVADO","1","5,5,5"},{"Camila Oliveira","camila.osasco@demo.com","Osasco","6","40","APROVADO","2","5,5,4,5"},{"Patricia Souza","patricia.osasco@demo.com","Osasco","2","28","APROVADO","1","5,4,5"},{"Fernanda Rocha","fer@demo.com","Campinas","1","45","PENDENTE","0",""},{"Gabriela Nunes","gabi@demo.com","Santos","6","85","APROVADO","2","5,4,5,5"},{"Helena Duarte","helena@demo.com","São Paulo","3","55","PENDENTE","1","4,5"},
        {"Isabela Martins","isabela@demo.com","Rio Branco","4","60","APROVADO","1","5,5,4"},{"Julia Costa","julia@demo.com","Maceió","3","55","PENDENTE","0","4,5"},
        {"Larissa Almeida","larissa@demo.com","Macapá","5","70","APROVADO","1","5,4,5"},{"Marina Ribeiro","marina@demo.com","Manaus","6","80","APROVADO","2","5,5,5"},
        {"Natalia Ferreira","natalia@demo.com","Salvador","4","65","APROVADO","1","5,4,5"},{"Olivia Santos","olivia@demo.com","Fortaleza","2","50","PENDENTE","0","4,4"},
        {"Paula Oliveira","paula@demo.com","Brasília","7","90","APROVADO","2","5,5,5"},{"Rafaela Lima","rafaela@demo.com","Vitória","3","60","APROVADO","1","5,4,5"},
        {"Sofia Carvalho","sofia@demo.com","Goiânia","5","75","APROVADO","2","5,5,4"},{"Talita Souza","talita@demo.com","São Luís","4","58","PENDENTE","0","4,5"},
        {"Valentina Rocha","valentina@demo.com","Cuiabá","6","78","APROVADO","2","5,5,5"},{"Yasmin Alves","yasmin@demo.com","Campo Grande","3","52","PENDENTE","0","4,4"},
        {"Alice Nascimento","alice@demo.com","Belo Horizonte","5","72","APROVADO","1","5,5,4"},{"Bianca Mendes","bianca@demo.com","Belém","4","62","APROVADO","1","5,4,5"},
        {"Camila Barros","camila@demo.com","João Pessoa","3","57","PENDENTE","0","4,5"},{"Daniela Freitas","daniela@demo.com","Curitiba","8","95","APROVADO","2","5,5,5"},
        {"Eduarda Gomes","eduarda@demo.com","Recife","4","65","APROVADO","1","5,4,5"},{"Flavia Cardoso","flavia@demo.com","Teresina","2","48","PENDENTE","0","4,4"},
        {"Giovana Pires","giovana@demo.com","Natal","5","68","APROVADO","1","5,5,4"},{"Heloisa Duarte","heloisa@demo.com","Porto Alegre","6","82","APROVADO","2","5,5,5"},
        {"Isis Monteiro","isis@demo.com","Porto Velho","3","55","PENDENTE","0","4,5"},{"Joana Martins","joana@demo.com","Boa Vista","4","63","APROVADO","1","5,4,5"},
        {"Karen Lopes","karen@demo.com","Florianópolis","7","88","APROVADO","2","5,5,5"},{"Luiza Reis","luiza@demo.com","Aracaju","3","56","PENDENTE","0","4,5"},
        {"Manuela Teixeira","manuela@demo.com","Palmas","4","64","APROVADO","1","5,4,5"}};
      String[] certN={"Primeiros socorros pediátricos","Cuidador infantil"}, certI={"Cruz Vermelha","SENAC"};
      List<Baba> babas=new ArrayList<>();
      for(String[] d:bs){
        Usuario u=novo(d[0],d[1],d[2],TipoUsuario.BABA,hash); ur.save(u);
        Baba b=new Baba(); b.setUsuario(u); b.setDescricao("Profissional cuidadosa, organizada e focada no bem-estar infantil."); b.setExperienciaAnos(Integer.valueOf(d[3])); b.setValorHora(new BigDecimal(d[4])); b.setDisponibilidade("Seg a Sex • 07:00 às 19:00"); b.setVerificada("APROVADO".equals(d[5])); b.setDisponivelAgora("Osasco".equalsIgnoreCase(d[2]) && "APROVADO".equals(d[5])); b=br.save(b);
        DocumentoVerificacao doc=new DocumentoVerificacao(); doc.setBaba(b); doc.setTipo("RG + comprovante de residência"); doc.setStatus(d[5]); dr.save(doc);
        for(int i=0;i<Integer.parseInt(d[6]);i++){ Certificado c=new Certificado(); c.setBaba(b); c.setNome(certN[i]); c.setInstituicao(certI[i]); c.setAno(2022+i); cr.save(c); }
        if(!d[7].isEmpty()){
          String[] ns=d[7].split(","); int soma=0;
          for(int i=0;i<ns.length;i++){ int n=Integer.parseInt(ns[i]); Avaliacao a=new Avaliacao(); a.setBaba(b); a.setPai(pais.get(i%pais.size())); a.setNota(n); a.setComentario(COMENT[i%COMENT.length]); a.setPontualidade(n==5||i%2==0); a.setComunicacao(true); a.setExperiencia(true); ar.save(a); soma+=n; }
          b.setNotaMedia(BigDecimal.valueOf((double)soma/ns.length).setScale(2,RoundingMode.HALF_UP)); b=br.save(b);
        }
        babas.add(b);
      }
      Object[][] ag={{0,StatusAgendamento.CONCLUIDO,-14},{1,StatusAgendamento.CONCLUIDO,-7},{4,StatusAgendamento.ACEITO,3},{2,StatusAgendamento.PENDENTE,5}};
      for(Object[] x:ag){ Agendamento a=new Agendamento(); a.setPai(pais.get(0)); a.setBaba(babas.get((Integer)x[0])); a.setDataServico(LocalDate.now().plusDays((Integer)x[2])); a.setHoraInicio(LocalTime.of(18,0)); a.setHoraFim(LocalTime.of(23,0)); a.setEndereco("Rua das Flores, 120, São Paulo"); a.setQuantidadeCriancas(2); a.setObservacoes("Jantar e hora de dormir às 21h."); a.setStatus((StatusAgendamento)x[1]); agr.save(a); }
    };
  }

  /** Acrescenta os perfis de demonstração mesmo quando o banco já tinha dados de uma versão anterior. */
  private static void seedBabasAdicionais(UsuarioRepository ur, PaiRepository pr, BabaRepository br, DocumentoVerificacaoRepository dr, PasswordEncoder enc) {
    String[][] extras={
      {"Elisa Martins","elisa.osasco@demo.com","Osasco","4","35","APROVADO"},{"Camila Oliveira","camila.osasco@demo.com","Osasco","6","40","APROVADO"},{"Patricia Souza","patricia.osasco@demo.com","Osasco","2","28","APROVADO"},
      {"Isabela Martins","isabela@demo.com","Rio Branco","4","60","APROVADO"},{"Julia Costa","julia@demo.com","Maceió","3","55","PENDENTE"},
      {"Larissa Almeida","larissa@demo.com","Macapá","5","70","APROVADO"},{"Marina Ribeiro","marina@demo.com","Manaus","6","80","APROVADO"},
      {"Natalia Ferreira","natalia@demo.com","Salvador","4","65","APROVADO"},{"Olivia Santos","olivia@demo.com","Fortaleza","2","50","PENDENTE"},
      {"Paula Oliveira","paula@demo.com","Brasília","7","90","APROVADO"},{"Rafaela Lima","rafaela@demo.com","Vitória","3","60","APROVADO"},
      {"Sofia Carvalho","sofia@demo.com","Goiânia","5","75","APROVADO"},{"Talita Souza","talita@demo.com","São Luís","4","58","PENDENTE"},
      {"Valentina Rocha","valentina@demo.com","Cuiabá","6","78","APROVADO"},{"Yasmin Alves","yasmin@demo.com","Campo Grande","3","52","PENDENTE"},
      {"Alice Nascimento","alice@demo.com","Belo Horizonte","5","72","APROVADO"},{"Bianca Mendes","bianca@demo.com","Belém","4","62","APROVADO"},
      {"Camila Barros","camila@demo.com","João Pessoa","3","57","PENDENTE"},{"Daniela Freitas","daniela@demo.com","Curitiba","8","95","APROVADO"},
      {"Eduarda Gomes","eduarda@demo.com","Recife","4","65","APROVADO"},{"Flavia Cardoso","flavia@demo.com","Teresina","2","48","PENDENTE"},
      {"Giovana Pires","giovana@demo.com","Natal","5","68","APROVADO"},{"Heloisa Duarte","heloisa@demo.com","Porto Alegre","6","82","APROVADO"},
      {"Isis Monteiro","isis@demo.com","Porto Velho","3","55","PENDENTE"},{"Joana Martins","joana@demo.com","Boa Vista","4","63","APROVADO"},
      {"Karen Lopes","karen@demo.com","Florianópolis","7","88","APROVADO"},{"Luiza Reis","luiza@demo.com","Aracaju","3","56","PENDENTE"},
      {"Manuela Teixeira","manuela@demo.com","Palmas","4","64","APROVADO"}
    };
    // Conta principal de demonstração direcionada a Osasco para testar a busca local.
    ur.findByEmailIgnoreCase("pai@demo.com").ifPresent(u -> {
      u.setCidade("Osasco"); u.setEstado("SP"); ur.save(u);
      pr.findAll().stream().filter(p -> p.getUsuario().getId().equals(u.getId())).findFirst().ifPresent(pr::save);
    });
    String hash=enc.encode("123456");
    for(String[] d:extras) {
      Usuario u = ur.findByEmailIgnoreCase(d[1]).orElse(null);
      if (u == null) {
        u=novo(d[0],d[1],d[2],TipoUsuario.BABA,hash);
        u=ur.save(u);
      }
      // Estes são perfis fictícios de demonstração. O estado de verificação simulado
      // é sincronizado também em bancos criados por versões anteriores do projeto.
      if (u.getTipo() == TipoUsuario.BABA && u.getEmail().endsWith("@demo.com")) {
        Baba b = br.findByUsuarioId(u.getId()).orElse(null);
        boolean perfilNovo = b == null;
        if (perfilNovo) {
          b=new Baba(); b.setUsuario(u); b.setDescricao("Perfil demonstrativo de babá. Confira as informações antes de contratar.");
          b.setExperienciaAnos(Integer.valueOf(d[3])); b.setValorHora(new BigDecimal(d[4]));
          b.setDisponibilidade("Seg a Sex • 07:00 às 19:00"); b.setNotaMedia(BigDecimal.ZERO);
        }
        String status = d[5];
        b.setVerificada("APROVADO".equals(status));
        // Apenas perfis de demonstração novos (ou migrados sem estado) começam disponíveis.
        if ("Osasco".equalsIgnoreCase(u.getCidade()) && "APROVADO".equals(status)
            && (perfilNovo || b.getDisponivelAgora() == null)) b.setDisponivelAgora(true);
        b = br.save(b);
        DocumentoVerificacao doc = dr.findByBabaId(b.getId()).orElseGet(DocumentoVerificacao::new);
        doc.setBaba(b);
        doc.setTipo("Documento demonstrativo");
        doc.setStatus(status);
        dr.save(doc);
      }
    }
    // Recupera também contas reais de babá que ficaram sem ficha no banco já existente.
    for (Usuario u : ur.findAll()) {
      if (u.getTipo() == TipoUsuario.BABA && !br.existsByUsuarioId(u.getId())) {
        Baba b = new Baba();
        b.setUsuario(u);
        b.setDescricao("Complete sua apresentação para que as famílias conheçam seu perfil.");
        b.setExperienciaAnos(0);
        b.setValorHora(BigDecimal.ZERO);
        b.setDisponibilidade("A combinar");
        b.setVerificada(false);
        b.setNotaMedia(BigDecimal.ZERO);
        br.save(b);
      }
    }
  }

  private static Usuario novo(String nome,String email,String cidade,TipoUsuario t,String hash){ Usuario u=new Usuario(); u.setNome(nome); u.setEmail(email); u.setSenha(hash); u.setTelefone("11988880000"); u.setCidade(cidade); u.setEstado("SP"); u.setTipo(t); return u; }
}
