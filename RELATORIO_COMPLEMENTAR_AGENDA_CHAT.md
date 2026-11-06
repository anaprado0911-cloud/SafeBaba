# SafeBaba — agenda semanal e chat em tempo real

## Implementações desta etapa

### Agenda semanal da babá
- Nova tela `/disponibilidade`, acessível por contas do tipo BABA.
- Cadastro dos dias da semana (segunda a domingo) e faixa de horário de início/fim.
- Validação de horários inválidos e faixas sobrepostas no mesmo dia.
- A configuração semanal passa a ser validada na criação de novos agendamentos.
- Para babás que ainda não cadastraram uma grade semanal, o comportamento anterior é mantido.
- A tela permite criar bloqueios excepcionais de folga com data/hora inicial, final e motivo.
- Bloqueios impedem novos agendamentos e não podem ser criados sobre atendimentos pendentes ou aceitos.
- O sistema impede remover ou alterar bloqueios pertencentes a outra babá.

### Chat em tempo real
- Adicionado endpoint WebSocket `/ws/chat/{conversaId}`.
- A conexão exige token JWT válido e verifica se o usuário é um dos participantes da conversa.
- Mensagens persistidas pela API são publicadas para as sessões conectadas à conversa.
- O Angular tenta WebSocket primeiro e mantém consulta periódica como fallback caso a conexão não esteja disponível.
- O proxy do Angular foi configurado para encaminhar `/ws` em modo WebSocket.

## Como testar

1. Inicie o backend normalmente.
2. Inicie o Angular com `npm install` e `npm start`.
3. Entre com uma conta de babá e abra **Agenda > Configurar horários e folgas**.
4. Cadastre, por exemplo, segunda a sexta, das 08:00 às 18:00, e salve.
5. Cadastre um bloqueio futuro de algumas horas.
6. Entre com uma conta de responsável e tente agendar:
   - dentro do horário semanal: deve permitir, se não houver conflito;
   - fora do horário semanal: deve rejeitar;
   - dentro do bloqueio: deve rejeitar;
   - no mesmo horário de outro atendimento pendente/aceito: deve rejeitar.
7. Para o chat, abra a mesma conversa em duas sessões/navegadores autenticados, um como responsável e outro como babá. Envie uma mensagem de um lado; o outro lado deve atualizar sem esperar a próxima consulta periódica quando WebSocket estiver conectado.

## Validação de build nesta sessão

Não foi possível executar a compilação completa nesta sessão:
- Maven Wrapper não conseguiu baixar Maven de `repo.maven.apache.org`.
- `frontend/node_modules` não está presente; portanto, o build Angular também depende de instalar as dependências.

Isso não deve ser interpretado como build aprovado. A compilação e os testes integrados ainda precisam ser executados em uma máquina com acesso ao repositório Maven e ao npm.

## Observações de produção
- Configure `APP_CORS_ORIGENS` com os domínios reais do frontend.
- Configure `APP_JWT_SECRET` persistente e forte.
- Use HTTPS/WSS em produção.
- Para alta disponibilidade com múltiplas instâncias do backend, substituir o broadcast em memória por um broker compartilhado (por exemplo, Redis ou RabbitMQ).
- O WebSocket envia aviso de nova mensagem; o conteúdo completo continua sendo carregado pela API autenticada.
