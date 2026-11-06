# Correções SafeBaba — endereço e regras dos planos

## Endereço de atendimento
- O campo Rua/Avenida usa agora o exemplo fictício `Rua das Flores` em vez de um endereço real.
- Estado passou a ser uma lista com as 27 UFs.
- Cidade passou a ser uma lista de municípios carregada pelo serviço público de localidades do IBGE, igual ao cadastro.
- No agendamento, cidade e UF são preenchidas inicialmente com os dados do responsável; se não houver dados, os campos permanecem em branco para preenchimento manual.
- No atendimento imediato, cidade e UF também são carregadas do perfil do responsável; se não houver dados, os campos permanecem em branco e o usuário deve selecionar estado e cidade. A lista de babás é atualizada ao trocar a cidade.

## Planos
- Gratuito: bloqueia nova contratação quando já existe um atendimento pendente ou aceito.
- Família: limite de 5 agendamentos no mês.
- Família+: limite de 10 agendamentos no mês.
- A seleção de plano continua demonstrativa, sem cobrança real.
- Não há taxa da plataforma implementada no cálculo de pagamentos; portanto, não há desconto de taxa a aplicar no Família+ e nenhum valor é descontado da remuneração da babá.

## Limites de validação
- O desconto de taxa da plataforma não foi implementado porque o sistema ainda não possui uma taxa de serviço configurada.
- A busca de municípios depende de conexão com a internet e da disponibilidade do serviço de localidades do IBGE.
- Não foi possível executar o build Angular nesta sessão porque `npm install` excedeu o tempo limite. O ZIP foi validado quanto à integridade, mas requer `npm install` e `npm run build` no ambiente do projeto.
