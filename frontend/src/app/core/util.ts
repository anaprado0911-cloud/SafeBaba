/** A API responde erros como {"erro": "mensagem"}. */
export function msgErro(e: unknown): string {
  const x = e as { status?: number; error?: { erro?: string } };
  if (x?.status === 0) return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
  if (x?.status === 401) return 'Sua sessão expirou. Entre novamente.';
  return x?.error?.erro ?? 'Não foi possível concluir a operação.';
}

export function iniciais(nome: string): string {
  return (nome || 'SB').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: 'Aguardando resposta', ACEITO: 'Aceito', RECUSADO: 'Recusado', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado',
};

export const ROTULO_EVENTO: Record<string, string> = {
  CODIGO: 'Código de chegada gerado', CHECKIN: 'Chegada confirmada', DIARIO: 'Diário', SOS: 'SOS acionado',
  MSG: 'Mensagem', PAGTO_RETIDO: 'Pagamento retido (simulado)', PAGTO_LIBERADO: 'Pagamento liberado (simulado)',
  CHECKOUT: 'Atendimento encerrado',
};
