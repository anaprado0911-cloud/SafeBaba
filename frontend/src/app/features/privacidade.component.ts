import { Component } from '@angular/core';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  template: `
    <section class="estreita pagina">
      <h1>Como protegemos seus dados</h1>
      <h2>O que coletamos</h2>
      <p>Só o necessário para conectar famílias e babás: nome, contato, cidade, perfil profissional, agendamentos e avaliações.</p>
      <h2>Dados de crianças</h2>
      <p>São sensíveis. Ficam visíveis apenas ao responsável e à babá de um agendamento, e somente enquanto ele existir.</p>
      <h2>Quem vê o quê</h2>
      <p>Contatos e dados pessoais não são exibidos publicamente. O código de chegada é mostrado só ao responsável. Alertas SOS são vistos pelos participantes do atendimento e pela equipe.</p>
      <h2>Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento. Senhas são guardadas com hash e nunca em texto puro.</p>
      <p class="muted">Projeto de demonstração: este texto é um resumo e não substitui uma política jurídica revisada.</p>
    </section>
  `,
})
export class PrivacidadeComponent {}
