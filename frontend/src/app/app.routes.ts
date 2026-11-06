import { Routes } from '@angular/router';
import { logadoGuard, tipoGuard } from './core/guards';

export const routes: Routes = [
  { path: '', title: 'Safe Babá', loadComponent: () => import('./features/home.component').then((m) => m.HomeComponent) },
  { path: 'babas', title: 'Encontrar babá', loadComponent: () => import('./features/busca.component').then((m) => m.BuscaComponent) },
  { path: 'babas/:id', title: 'Perfil da babá', loadComponent: () => import('./features/baba-detalhe.component').then((m) => m.BabaDetalheComponent) },
  { path: 'login', title: 'Entrar', loadComponent: () => import('./features/login.component').then((m) => m.LoginComponent) },
  { path: 'cadastro', title: 'Criar conta', loadComponent: () => import('./features/cadastro.component').then((m) => m.CadastroComponent) },
  { path: 'privacidade', title: 'Privacidade', loadComponent: () => import('./features/privacidade.component').then((m) => m.PrivacidadeComponent) },
  { path: 'painel', title: 'Meu painel', canActivate: [logadoGuard], loadComponent: () => import('./features/painel.component').then((m) => m.PainelComponent) },
  { path: 'agenda', title: 'Minha agenda', canActivate: [tipoGuard('PAI', 'BABA')], loadComponent: () => import('./features/agenda.component').then((m) => m.AgendaComponent) },
  { path: 'documentos', title: 'Documentos da babá', canActivate: [tipoGuard('BABA')], loadComponent: () => import('./features/documentos-baba.component').then((m) => m.DocumentosBabaComponent) },
  { path: 'disponibilidade', title: 'Minha disponibilidade', canActivate: [tipoGuard('BABA')], loadComponent: () => import('./features/disponibilidade.component').then((m) => m.DisponibilidadeComponent) },
  { path: 'assinatura', title: 'Plano da família', canActivate: [tipoGuard('PAI')], loadComponent: () => import('./features/assinatura.component').then((m) => m.AssinaturaComponent) },
  { path: 'mensagens', title: 'Minhas mensagens', canActivate: [tipoGuard('BABA')], loadComponent: () => import('./features/mensagens.component').then((m) => m.MensagensComponent) },
  { path: 'mensagens/:conversaId', title: 'Conversa', canActivate: [tipoGuard('BABA')], loadComponent: () => import('./features/mensagem-conversa.component').then((m) => m.MensagemConversaComponent) },
  { path: 'chat/:babaId', title: 'Conversar com babá', canActivate: [tipoGuard('PAI')], loadComponent: () => import('./features/chat.component').then((m) => m.ChatComponent) },
  { path: 'pagamentos', title: 'Meus pagamentos', canActivate: [tipoGuard('PAI', 'BABA')], loadComponent: () => import('./features/pagamentos.component').then((m) => m.PagamentosComponent) },
  { path: 'agendar/:babaId', title: 'Agendar', canActivate: [tipoGuard('PAI')], loadComponent: () => import('./features/agendar.component').then((m) => m.AgendarComponent) },
  { path: 'agora', title: 'Preciso agora', canActivate: [tipoGuard('PAI')], loadComponent: () => import('./features/agora.component').then((m) => m.AgoraComponent) },
  { path: 'atendimento/:id', title: 'Atendimento', canActivate: [tipoGuard('PAI', 'BABA')], loadComponent: () => import('./features/atendimento.component').then((m) => m.AtendimentoComponent) },
  { path: 'criancas', title: 'Cartão de cuidados', canActivate: [tipoGuard('PAI')], loadComponent: () => import('./features/criancas.component').then((m) => m.CriancasComponent) },
  { path: 'notificacoes', title: 'Notificações', canActivate: [logadoGuard], loadComponent: () => import('./features/notificacoes.component').then((m) => m.NotificacoesComponent) },
  { path: 'admin', title: 'Moderação', canActivate: [tipoGuard('ADMIN')], loadComponent: () => import('./features/admin.component').then((m) => m.AdminComponent) },
  { path: '**', redirectTo: '' },
];
