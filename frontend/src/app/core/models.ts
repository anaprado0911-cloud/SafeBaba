export type Tipo = 'PAI' | 'BABA' | 'ADMIN';
export type StatusAgendamento = 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CONCLUIDO' | 'CANCELADO';

export interface Sessao { token: string; id: number; nome: string; email: string; tipo: Tipo; mensagem?: string; }

export interface Baba {
  id: number; nome: string; cidade: string; estado: string; descricao: string | null;
  experienciaAnos: number | null; valorHora: number; disponibilidade: string | null;
  verificada: boolean; notaMedia: number; disponivelAgora?: boolean; latitude?: number | null; longitude?: number | null;
}
export interface ItemConfianca { nome: string; pontos: number; max: number; }
export interface Confianca { babaId: number; selos: string[]; score: number; nivel: string; itens: ItemConfianca[]; }
export interface AvaliacaoPublica { id: number; nota: number; comentario: string; criadoEm: string; }

export interface Agendamento {
  id: number; paiId: number; babaId: number; babaNome: string; dataServico: string;
  horaInicio: string; horaFim: string; endereco: string; quantidadeCriancas: number;
  observacoes: string | null; status: StatusAgendamento;
}
export interface PaiPerfil { id: number; usuarioId: number; nome: string; cidade: string; estado: string; endereco?: string; }
export interface EventoLinha { tipo: string; texto: string; criadoEm: string; de: 'PAI' | 'BABA'; }
export interface Cuidado {
  id: number; nome: string; idade: number; alergias: string | null; remedios: string | null;
  rotina: string | null; pediatra: string | null; contato: string | null;
}
export interface Notificacao { agendamentoId: number; tipo: string; texto: string; criadoEm: string; }
export interface ResumoAdmin { usuarios: number; babasVerificadas: number; babasPendentes?: number; babasReprovadas?: number; documentosPendentes?: number; agendamentos: number; denuncias: number; sos: number; }
export interface DocPendente { id: number; babaId: number; nome: string; tipo: string; status: string; motivoReprovacao?: string | null; nomeArquivo?: string | null; temArquivo?: boolean; }
export interface BabaAdmin {
  id: number; nome: string; email: string; telefone: string; dataNascimento: string | null;
  cidade: string | null; estado: string | null; descricao: string | null; experienciaAnos: number | null;
  valorHora: number | null; disponibilidade: string | null; verificada: boolean;
  statusVerificacao: 'PENDENTE' | 'VERIFICADA' | 'REPROVADA'; motivoVerificacao?: string | null;
  documentoTipo?: string | null; documentoStatus: string; motivoDocumento?: string | null;
}
export interface SosAdmin {
  agendamentoId: number;
  texto: string;
  criadoEm: string;
  latitude?: number | null;
  longitude?: number | null;
  endereco?: string | null;
}


export interface Pagamento {
  id: number;
  agendamentoId: number;
  valor: number;
  status: 'RETIDO' | 'LIBERADO';
  criadoEm: string;
  dataServico: string;
  horaInicio: string;
  horaFim: string;
  babaNome: string;
  responsavelNome: string;
}
