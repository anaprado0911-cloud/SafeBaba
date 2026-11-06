# Relatório de alterações – Safe Babá

## 1. Resumo
Execução parcial do prompt (Fase 1, itens 1 e 3). Foco em segurança e na busca com o Índice de Confiança visível. Nada foi compilado nem executado: o ambiente não tinha acesso à internet para baixar as dependências do Maven.

## 2. Diagnóstico inicial
- Já funcionava: cadastro/login JWT, busca por cidade, perfil, agendamento, avaliações, `/api/confianca` (0–100, explicável), visual com tema claro/escuro e modo demo.
- Esqueleto: chat, emergência, painel admin, pagamentos, notificações, favoritos (contador fixo) e denúncias (sem tela).
- Riscos encontrados:
  - `/api/admin/**` acessível por qualquer usuário logado (**corrigido**).
  - `GET /api/usuarios/{id}` devolvia e-mail e telefone de qualquer pessoa para qualquer usuário logado (**corrigido**).
  - `POST /api/denuncias` e `POST /api/conversas` recebem entidades JPA no `@RequestBody` (não corrigido).
  - `GET /api/pais/{id}` expõe dados de terceiros e a chave JWT está no `application.properties` (não corrigidos).

## 3. Funcionalidades entregues
| Item | Status |
|---|---|
| Revisão de segurança (admin só ADMIN; dados do usuário só do próprio ou ADMIN) | parcial |
| Busca com filtros: valor máximo, nota mínima, só verificadas, ordenação (mais confiáveis, nota, preço) | completa (filtra no navegador) |
| Anel animado do Índice de Confiança nos cartões, com detalhamento por item, dados de `/api/confianca` | completa |
| Perfil da babá com o Índice de Confiança detalhado | completa |

## 3b. Atendimento seguro (rodada 2)
| Código de chegada (6 dígitos, só o responsável vê) + check-in da babá | completa, não testada |
| Diário ao vivo (atalhos de um toque) + check-out | completa, não testada |
| Botão SOS (localização do navegador, se permitida), listado em `GET /api/admin/sos` | completa, não testada |
| Tela `atendimento.html` com linha do tempo atualizada a cada 5 s (polling) | completa, não testada |

## 3c. Rodada 3
| "Preciso agora": sugere as 3 babás verificadas de maior Índice de Confiança na cidade do responsável; "Chamar agora" cria o agendamento (observação URGENTE) e abre o acompanhamento. Sem mapa e sem aceite da babá. | parcial, não testada |
| Painel admin real: indicadores, fila de aprovação de documentos (aprova e marca a babá como verificada) e lista de SOS | completa, não testada |
| Conta admin de demonstração: `admin@demo.com` / `123456` (criada mesmo em banco já existente) | completa, não testada |

## 3d. Rodada 4
| Aceite da babá: tela `agenda.html` (babá aceita/recusa, responsável cancela, ambos abrem o acompanhamento) + `GET /api/agendamentos/minha-agenda` | completa, não testada |
| Chat por atendimento: mensagens entre responsável e babá na linha do tempo (`POST /api/atendimentos/{id}/mensagem`), reaproveitando `eventos_atendimento`; `chat.html` redireciona para a agenda | completa, não testada |
| Segurança de agendamentos: só o responsável cria o próprio agendamento, só o dono (ou ADMIN) lista, e a mudança de status respeita o papel (babá: aceitar/recusar/concluir; responsável: cancelar). Antes qualquer usuário logado podia alterar qualquer um. | completa, não testada |
| Correção: o acompanhamento não apaga mais o texto digitado a cada atualização de 5 s | completa |

## 3e. Rodada 5
| QR Code de chegada: o responsável vê o QR (biblioteca qrcodejs via cdnjs; sem ela, continua o código numérico). A babá escaneia pelo botão (BarcodeDetector, câmera) ou pela câmera do celular, que abre o link e confirma a chegada sozinho | completa, não testada |
| Favoritos reais (`favoritos`, `GET/POST /api/favoritos`), coração nos cartões e contador no painel | completa, não testada |
| Página de privacidade (LGPD) e aceite obrigatório no cadastro | completa (texto resumido, sem revisão jurídica) |
| Chave JWT lida da variável `APP_JWT_SECRET` (mantém o valor atual como padrão de demonstração) | completa |

## 3f. Rodada 6 (final)
| Cartão de cuidados da criança (`criancas.html`, `/api/cuidados`); a babá vê só durante o atendimento em andamento | completa, não testada |
| Notificações: sino com contador em todas as páginas e `notificacoes.html`, geradas a partir dos eventos do atendimento (o "lido" é guardado no navegador) | parcial, não testada |
| Pagamento simulado: PIX retido pelo responsável e liberado automaticamente no check-out (valor = valor/h × duração) | simulada, não testada |
| Avaliação guiada ao fim do atendimento (nota, pontual, comunicação, experiência, comentário) usando `/api/avaliacoes` | completa, não testada |
| Selos de verificação calculados (documento, primeiros socorros, 5+ anos, pontual, avaliada por famílias) em cartões e perfil | completa, não testada |
| Mapa no "Preciso agora" (Leaflet + OpenStreetMap) com posições **simuladas** | simulada, não testada |
| Segurança: `/api/pais/**` só para o próprio usuário ou ADMIN | completa, não testada |
| `testar.sh`: teste de ponta a ponta com curl (15 verificações, incluindo as de permissão) | criado, não executado |

## 3g. Rodada 7: novo visual (front-end)
| Tema "sol e violeta" em `css/tema.css`, aplicado a todas as páginas (fundo creme, violeta, amarelo-sol e coral; botões em pílula com sombra de "adesivo"; cartões arredondados; tema escuro recolorido). Só troca variáveis e componentes, sem mexer na lógica | completa, não vista no navegador |
| Home redesenhada: título com destaque, formas flutuantes, faixa animada de selos, grade "Segurança que dá para ver" (Índice, QR, diário, SOS, pagamento) e revelação ao rolar; respeita `prefers-reduced-motion` | completa, não vista no navegador |

## 4. Banco de dados
Novas tabelas `eventos_atendimento`, `favoritos` e `cuidados` (entidade `Evento`, criada pelo `ddl-auto=update` no H2 e declarada no `schema.sql` para MySQL). `data.sql` sem alterações.

## 5. Back-end
- `SecurityConfig`: `/api/admin/**` exige a role ADMIN.
- `UsuarioController.buscar`: retorna 403 se quem consulta não for o dono nem ADMIN.
- Não existe usuário ADMIN nos dados de demonstração, então o painel admin fica bloqueado até ele ser criado.

## 6. Front-end
- `js/app.js`: `loadBabas` reescrita, mais `ring`, `confDetalhe`, `renderBabas` e `renderConfianca`.
- `busca.html`: formulário de filtros.
- `perfil-baba.html`: seção `#confianca`.
- `css/styles.css`: bloco novo no final (anel com `@property`, filtros, `prefers-reduced-motion`).

## 7. Arquivos
Rodada 2, criados: `Evento.java`, `EventoRepository.java`, `AtendimentoController.java`, `atendimento.html`. Alterados: `SecurityConfig.java` (libera a página), `schema.sql`, `app.js` (link de acompanhamento após agendar).

Modificados: `SecurityConfig.java`, `UsuarioController.java`, `app.js`, `busca.html`, `perfil-baba.html`, `styles.css`. Criado: este relatório.

Rodada 3, criados: `AdminInitializer.java`. Reescritos: `AdminController.java`, `painel-admin.html`, `emergencia.html`.

Rodada 4, criados: `agenda.html`. Alterados: `painel.html` (link da agenda), `AgendamentoController.java`, `AtendimentoController.java`, `SecurityConfig.java`, `atendimento.html`, `chat.html`.

Rodada 5, criados: `Favorito.java`, `FavoritoRepository.java`, `FavoritoController.java`, `privacidade.html`. Alterados: `atendimento.html`, `app.js`, `styles.css`, `painel.html`, `cadastro.html`, `SecurityConfig.java`, `schema.sql`, `application.properties`.

Rodada 7, criado: `css/tema.css`. Alterados: `index.html` e o `<head>` de todas as páginas (link do tema).

Rodada 6, criados: `Cuidado.java`, `CuidadoRepository.java`, `CuidadoController.java`, `criancas.html`, `notificacoes.html`, `testar.sh`. Alterados: `AtendimentoController.java`, `ConfiancaController.java`, `PaiController.java`, `EventoRepository.java`, `CertificadoRepository.java`, `SecurityConfig.java`, `app.js`, `atendimento.html`, `emergencia.html`, `painel.html`, `styles.css`, `schema.sql`.

## 8. Limitações
Nada foi compilado nem executado (sem acesso à internet para o Maven). Primeiro passo: `./mvnw spring-boot:run` e depois `bash testar.sh`. A babá usada em `testar.sh` é `ana@demo.com` (babá id 1 no seed).
Simulados: PIX, posições no mapa, aceite de pagamento. Não feitos: testes JUnit (as anotações de teste do Spring Boot 4 não puderam ser verificadas offline), upload real de documentos pela babá, vídeo de apresentação, assistente com IA, WebSocket (o chat usa atualização a cada 5 s), compatibilidade em %.
Limites conhecidos: `POST /api/avaliacoes`, `/api/denuncias` e `/api/conversas` ainda aceitam dados sem checar o dono; o "lido" das notificações vive no navegador; o banco H2 em arquivo (`./data`) pode precisar ser apagado se o esquema antigo conflitar.

## 3h. Rodada 8: frontend Angular e correções de segurança
Nada foi compilado nem executado nesta rodada (sem Java, Maven nem npm no ambiente de edição).

| Item | Status |
|---|---|
| Frontend Angular 18 em `frontend/` substitui as telas HTML (guardadas em `legacy-static/`): início, busca com Índice de Confiança, perfil, cadastro, login, painel, agenda, agendamento, "Preciso agora" (mapa), atendimento (código/QR, diário, SOS, pagamento simulado, cuidados, avaliação), cartão de cuidados, notificações, privacidade e moderação. Novo visual (crachá escolar, tema claro/escuro). Build vai direto para `src/main/resources/static`; rotas com `#` | completa, não compilada |
| `POST /api/denuncias` usa DTO; o autor vem do token, status e data não vêm do cliente | completa, não testada |
| `POST /api/conversas` usa DTO; só o responsável abre, reaproveita a conversa existente; leitura e envio de mensagens só para participantes; remetente vem do token | completa, não testada |
| `POST /api/avaliacoes`: só o responsável dono do atendimento, só se concluído, uma vez por atendimento; babá e responsável são deduzidos do agendamento | completa, não testada |
| Check-out agora marca o agendamento como CONCLUIDO (necessário para liberar a avaliação) | completa, não testada |
| Chave JWT removida do `application.properties`: vem de `APP_JWT_SECRET`; sem ela, chave aleatória por execução e aviso no log | completa, não testada |
| `SecurityConfig`: 401 para quem não está logado, GET público só em `/api/babas`, `/api/confianca`, `/api/avaliacoes/baba`; `/h2-console` bloqueado; CORS restrito a `APP_CORS_ORIGENS` | completa, não testada |
| `ApiExceptionHandler`: acesso negado vira 403, validação e corpo inválido viram 400, não encontrado vira 404 (antes tudo virava 500) | completa, não testada |
| `spring.jpa.open-in-view=true`: os controllers leem relações lazy fora de transação; com `false` várias rotas falhariam com LazyInitializationException | decisão técnica |
| `testar.sh`: 14 verificações novas (avaliações, denúncias, conversas, 401) | criado, não executado |

Fora desta rodada: upload real de documentos, WebSocket (o atendimento atualiza a cada 5 s), refresh token.

## Melhorias solicitadas (28/10/2026)
- Cadastro: senha agora exige no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula e um número. O formulário mostra os requisitos e quais já foram atendidos.
- Cadastro: validação mais clara dos campos obrigatórios, confirmação de senha e aceite da política antes de enviar.
- API: os mesmos requisitos de senha são validados no backend, para não depender apenas do navegador.
- Perfis demonstrativos: ampliada a base de babás de demonstração para incluir as capitais dos estados brasileiros, além de São Paulo, Campinas e Santos. O carregamento também acrescenta os novos perfis em bancos já inicializados sem duplicar e-mails.
- A listagem `/api/babas` sem filtro de cidade continua retornando todas as babás; a busca por cidade continua disponível.

Observação: não foi possível executar os testes de build nesta sessão porque o ambiente não conseguiu baixar as dependências do Maven/npm. Recomenda-se rodar `bash mvnw test` e `cd frontend && npm install && npm run build` no ambiente de desenvolvimento.


## Disponibilidade para atendimento imediato
- Adicionado o campo `disponivelAgora` ao perfil de babá.
- A babá pode ativar/desativar a opção “Estou disponível para atendimento imediato” no painel.
- A alteração é salva no backend e persiste no banco H2.
- A busca “Preciso agora” lista somente babás verificadas e com disponibilidade imediata ativada, na cidade do responsável.
- Os perfis fictícios de Osasco começam disponíveis para facilitar o primeiro teste; em banco existente, perfis demonstrativos sem estado de disponibilidade também são inicializados como disponíveis uma única vez.
- A conta de demonstração `pai@demo.com` é configurada para Osasco.
- A disponibilidade não é geolocalização nem confirmação automática de agenda: a profissional deve desligar o status quando não puder receber pedidos. Notificações em tempo real, raio de busca e localização GPS não estão incluídos.

## Melhorias adicionais (agenda, chat, fidelidade, assinatura e administração)
- Agendamento: bloqueio no backend de sobreposição de horários para a mesma babá na mesma data, considerando solicitações pendentes e confirmadas. O horário final precisa ser posterior ao inicial.
- Chat: tela Angular de conversa com atualização periódica e envio de mensagens, conectada aos endpoints autenticados já existentes. A abertura pelo perfil da babá está disponível para responsáveis.
- Favoritos e avaliações: mantidos os endpoints e telas existentes; a tela de perfil continua exibindo avaliações e permite favoritar.
- Fidelidade: 10 pontos por atendimento concluído, com níveis Iniciante, Bronze, Prata e Ouro. Pontuação demonstrativa, sem valor monetário ou resgate financeiro.
- Assinatura: planos Gratuito, Família (R$ 29,90/mês) e Família+ (R$ 59,90/mês), com seleção persistida no backend. A ativação é demonstrativa e não cobra valores; os limites e benefícios são informativos nesta etapa e ainda não são aplicados como bloqueios/descontos na contratação.
- Administração: painel ampliado com listagem de usuários, últimos agendamentos, fila de documentos, denúncias com mudança de status e alertas SOS. APIs sob ROLE_ADMIN.

## Limitações e validação
- A disponibilidade é protegida por validação de conflito no servidor, mas ainda não existe grade semanal editável de horários recorrentes nem bloqueios manuais de folgas.
- O chat atual usa atualização periódica HTTP, não WebSocket/push.
- Não foi possível executar os builds nesta sessão: Maven wrapper não conseguiu baixar o Maven (ambiente sem acesso ao repositório) e o frontend não possui dependências instaladas/cache local disponível. Faça `bash mvnw test` e `cd frontend && npm install && npm run build` em ambiente com acesso aos repositórios antes de publicar.
- A assinatura não possui cobrança recorrente real; integrar um PSP, webhooks, cancelamento, termos e tratamento de falhas antes de disponibilizar planos pagos.


## Migração de banco (2026-11)
O projeto foi atualizado para usar exclusivamente Microsoft SQL Server. As referências a H2/MySQL neste relatório descrevem o estado histórico anterior à migração e não representam a configuração atual. Consulte README.md e LEIA-ME-EXECUCAO.txt para a configuração vigente.
