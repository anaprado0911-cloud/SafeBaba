import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Agendamento, AvaliacaoPublica, Baba, BabaAdmin, Confianca, Cuidado, DocPendente, EventoLinha, Notificacao,
  PaiPerfil, Pagamento, ResumoAdmin, SosAdmin, StatusAgendamento,
} from './models';

const B = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // público
  babas(cidade = '') {
    const params = cidade ? new HttpParams().set('cidade', cidade) : undefined;
    return this.http.get<Baba[]>(`${B}/babas`, { params });
  }
  baba(id: number) { return this.http.get<Baba>(`${B}/babas/${id}`); }
  babasDisponiveis(cidade = '') {
    let params = new HttpParams().set('somenteDisponiveis', 'true');
    if (cidade) params = params.set('cidade', cidade);
    return this.http.get<Baba[]>(`${B}/babas`, { params });
  }
  minhaDisponibilidade() { return this.http.get<{ disponivelAgora: boolean }>(`${B}/babas/minha-disponibilidade`); }
  alterarDisponibilidade(disponivelAgora: boolean) { return this.http.patch<{ disponivelAgora: boolean }>(`${B}/babas/minha-disponibilidade`, { disponivelAgora }); }
  atualizarMinhaLocalizacao(latitude: number, longitude: number) { return this.http.patch(`${B}/babas/minha-localizacao`, { latitude, longitude }); }
  confiancas() { return this.http.get<Record<number, Confianca>>(`${B}/confianca`); }
  confianca(id: number) { return this.http.get<Confianca>(`${B}/confianca/${id}`); }
  avaliacoesDaBaba(id: number) { return this.http.get<AvaliacaoPublica[]>(`${B}/avaliacoes/baba/${id}`); }

  // favoritos e denúncias
  favoritos() { return this.http.get<number[]>(`${B}/favoritos`); }
  alternarFavorito(id: number) { return this.http.post<{ favorito: boolean }>(`${B}/favoritos/${id}`, {}); }
  denunciar(motivo: string, descricao: string) { return this.http.post(`${B}/denuncias`, { motivo, descricao }); }

  // responsável
  paiPorUsuario(usuarioId: number) { return this.http.get<PaiPerfil>(`${B}/pais/usuario/${usuarioId}`); }
  pai(id: number) { return this.http.get<PaiPerfil>(`${B}/pais/${id}`); }

  // pagamentos
  meusPagamentos() { return this.http.get<Pagamento[]>(`${B}/pagamentos`); }

  // assinatura dos responsáveis (modo demonstração até integração de cobrança)
  planosAssinatura() { return this.http.get<any[]>(`${B}/assinatura/planos`); }
  minhaAssinatura() { return this.http.get<any>(`${B}/assinatura/minha`); }
  assinarPlano(plano: string) { return this.http.post<any>(`${B}/assinatura/assinar`, { plano }); }
  cancelarAssinatura() { return this.http.post<any>(`${B}/assinatura/cancelar`, {}); }
  minhaFidelidade() { return this.http.get<any>(`${B}/assinatura/fidelidade`); }

  // chat entre responsável e babá
  abrirConversa(babaId: number) { return this.http.post<{id:number}>(`${B}/conversas`, { babaId }); }
  mensagensConversa(id: number) { return this.http.get<any[]>(`${B}/conversas/${id}/mensagens`); }
  minhasConversas() { return this.http.get<any[]>(`${B}/conversas/minhas`); }
  enviarMensagem(conversaId: number, conteudo: string) { return this.http.post<any>(`${B}/mensagens`, { conversaId, conteudo }); }

  disponibilidadePublica(id: number, inicio: string, fim: string) { return this.http.get<any>(`${B}/babas/${id}/disponibilidade`, { params: new HttpParams().set('inicio', inicio).set('fim', fim) }); }

  // agenda semanal da babá e bloqueios de folga
  meusHorariosSemana() { return this.http.get<Array<{diaSemana:number;inicio:string;fim:string}>>(`${B}/babas/minha-agenda-config/horarios`); }
  salvarHorariosSemana(slots: Array<{diaSemana:number;inicio:string;fim:string}>) { return this.http.put(`${B}/babas/minha-agenda-config/horarios`, slots); }
  meusBloqueios(inicio:string,fim:string) { return this.http.get<any[]>(`${B}/babas/minha-agenda-config/bloqueios`, {params:new HttpParams().set('inicio',inicio).set('fim',fim)}); }
  criarBloqueio(inicio:string,fim:string,motivo:string) { return this.http.post(`${B}/babas/minha-agenda-config/bloqueios`, {inicio,fim,motivo}); }
  removerBloqueio(id:number) { return this.http.delete(`${B}/babas/minha-agenda-config/bloqueios/${id}`); }

  // agenda
  criarAgendamento(corpo: object) { return this.http.post<Agendamento>(`${B}/agendamentos`, corpo); }
  minhaAgenda() { return this.http.get<Agendamento[]>(`${B}/agendamentos/minha-agenda`); }
  mudarStatus(id: number, valor: StatusAgendamento) {
    return this.http.patch<Agendamento>(`${B}/agendamentos/${id}/status`, {}, { params: new HttpParams().set('valor', valor) });
  }
  avaliar(corpo: object) { return this.http.post(`${B}/avaliacoes`, corpo); }

  // atendimento
  linha(id: number) { return this.http.get<EventoLinha[]>(`${B}/atendimentos/${id}/linha`); }
  acao(id: number, caminho: string, corpo: object = {}) { return this.http.post(`${B}/atendimentos/${id}/${caminho}`, corpo); }
  cuidadosDoAtendimento(id: number) { return this.http.get<Cuidado[]>(`${B}/atendimentos/${id}/cuidados`); }
  notificacoes() { return this.http.get<Notificacao[]>(`${B}/notificacoes`); }

  // cartão de cuidados
  cuidados() { return this.http.get<Cuidado[]>(`${B}/cuidados`); }
  criarCuidado(corpo: object) { return this.http.post<Cuidado>(`${B}/cuidados`, corpo); }
  removerCuidado(id: number) { return this.http.delete(`${B}/cuidados/${id}`); }

  // documentos da babá
  meuDocumento() { return this.http.get<any>(`${B}/documentos-baba/meu`); }
  enviarDocumento(form: FormData) { return this.http.post<any>(`${B}/documentos-baba`, form); }

  // administração
  resumoAdmin() { return this.http.get<ResumoAdmin>(`${B}/admin/resumo`); }
  docsPendentes() { return this.http.get<DocPendente[]>(`${B}/admin/documentos/pendentes`); }
  abrirDocumentoAdmin(babaId: number) { return this.http.get(`${B}/admin/documentos/${babaId}/arquivo`, { responseType: 'blob' }); }
  aprovarDoc(babaId: number) { return this.http.post(`${B}/admin/documentos/${babaId}/aprovar`, {}); }
  reprovarDoc(babaId: number, motivo: string) { return this.http.post(`${B}/admin/documentos/${babaId}/reprovar`, { motivo }); }
  adminBabas() { return this.http.get<BabaAdmin[]>(`${B}/admin/babas`); }
  aprovarBaba(babaId: number) { return this.http.post(`${B}/admin/babas/${babaId}/aprovar`, {}); }
  reprovarBaba(babaId: number, motivo: string) { return this.http.post(`${B}/admin/babas/${babaId}/reprovar`, { motivo }); }
  sosAdmin() { return this.http.get<SosAdmin[]>(`${B}/admin/sos`); }
  adminUsuarios() { return this.http.get<any[]>(`${B}/admin/usuarios`); }
  adminAgendamentos() { return this.http.get<any[]>(`${B}/admin/agendamentos`); }
  adminDenuncias() { return this.http.get<any[]>(`${B}/admin/denuncias`); }
  atualizarDenuncia(id:number,status:string) { return this.http.patch(`${B}/admin/denuncias/${id}/status`,{}, {params:new HttpParams().set('status',status)}); }
}
