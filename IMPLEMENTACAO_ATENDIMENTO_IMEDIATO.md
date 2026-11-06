# Atendimento imediato – notificações, localização e reencaminhamento

## O que entrou nesta versão

1. **Aviso de nova solicitação:** a tela Minha agenda da babá consulta a agenda a cada 8 segundos enquanto permanece aberta. Se detectar um novo pedido urgente, mostra uma notificação do navegador quando a permissão foi concedida. A permissão é solicitada quando a babá ativa a disponibilidade. Não é push e não funciona com o navegador totalmente fechado.
2. **Localização por GPS:** ao ativar a disponibilidade, o navegador pede permissão para obter as coordenadas atuais da babá e o backend as salva no perfil. Na tela Preciso agora, o navegador do responsável também pode compartilhar sua localização. A lista calcula distância em linha reta e prioriza babás com coordenadas conhecidas; o mapa só mostra coordenadas reais compartilhadas, sem fabricar marcadores. Se a pessoa negar a permissão, a busca por cidade continua funcionando.
3. **Reencaminhamento automático:** um pedido urgente que continuar PENDENTE por 90 segundos é atribuído a outra babá verificada e disponível da mesma cidade, sem repetir profissionais já tentadas. A babá atual volta a ficar disponível e a nova é marcada como ocupada. O agendamento mantém o mesmo ID. Se não houver outra profissional, o pedido é cancelado.

## Teste manual recomendado

- Entre como babá, ative disponibilidade e permita notificações e localização.
- Deixe a tela Minha agenda aberta.
- Entre como responsável em outro navegador/perfil, abra Preciso agora e faça uma solicitação urgente.
- Confirme que a primeira babá recebe aviso (até 8 segundos, com a agenda aberta).
- Não responda por 90 segundos: o backend deverá reencaminhar para outra babá disponível da mesma cidade.
- Alternativamente, clique em Recusar: o encaminhamento deve ocorrer imediatamente.
- Teste com permissão de localização concedida nos dois dispositivos para ver distâncias aproximadas e marcadores GPS.

## Limitações e cuidados

- Notificações são polling no navegador, não Web Push/FCM; o navegador precisa estar aberto e a tela Minha agenda da babá ativa.
- A distância é uma linha reta entre a localização atual do dispositivo do responsável e a última posição compartilhada pela babá. Não é distância por ruas nem ETA; o endereço digitado do atendimento ainda não é geocodificado.
- A babá precisa atualizar a disponibilidade quando se deslocar. Coordenadas são dados pessoais; em produção, exibir localização aproximada antes do aceite e revelar endereço completo somente após a contratação, com consentimento e política de retenção.
- O reencaminhamento considera cidade cadastrada, verificação e disponibilidade. Não valida conflitos completos de agenda, trânsito ou raio máximo.
- Pagamento segue simulado; esta mudança não cria cobrança nem custódia real.
