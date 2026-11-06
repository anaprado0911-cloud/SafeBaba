# Correção do serviço de agendamento

## O que foi ajustado
- Reorganizado `AgendamentoService` com código legível e responsabilidades separadas.
- Validação dos campos obrigatórios, quantidade de crianças, endereço e horários.
- Bloqueio de datas passadas e de horários finais anteriores/iguais ao início.
- Validação da disponibilidade semanal e dos bloqueios da babá.
- Prevenção de sobreposição com agendamentos pendentes ou aceitos.
- Aplicação dos limites dos planos `GRATUITO`, `FAMILIA` e `FAMILIA_PLUS`.
- Benefícios de planos pagos deixam de valer quando a assinatura está inativa ou vencida.
- Transições de status inválidas são rejeitadas (por exemplo, concluir um agendamento ainda pendente).

## Arquivo
`src/main/java/com/safebaba/service/AgendamentoService.java`

## Validação
A compilação Maven não pôde ser concluída neste ambiente: o Maven Wrapper tentou baixar Maven 3.9.11 de `repo.maven.apache.org`, mas o download falhou. Portanto, a alteração foi revisada, mas ainda precisa ser compilada no computador com acesso às dependências.
