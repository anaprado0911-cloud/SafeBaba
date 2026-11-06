#!/usr/bin/env bash
# Teste de ponta a ponta da API. Com o servidor rodando: bash testar.sh [http://localhost:8080/api]
B=${1:-http://localhost:8080/api}; ok=0; f=0
j(){ grep -o "\"$1\":\"\?[^\",}]*" | head -1 | sed 's/.*:"\?//'; }
r(){ curl -s -o /tmp/r.json -w '%{http_code}' -X "$1" "$B$2" -H "Authorization: Bearer $3" -H 'Content-Type: application/json' ${4:+-d "$4"}; }
chk(){ if [ "$2" = "$3" ]; then echo "OK    $1"; ok=$((ok+1)); else echo "FALHA $1 (esperado $3, veio $2)"; f=$((f+1)); fi; }
login(){ curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"senha\":\"123456\"}"; }
L=$(login pai@demo.com); TP=$(echo "$L"|j token); UP=$(echo "$L"|j id)
L=$(login ana@demo.com); TB=$(echo "$L"|j token); UB=$(echo "$L"|j id)
TA=$(login admin@demo.com|j token)
TR=$(login rafael@demo.com|j token)
PAI=$(curl -s $B/pais/usuario/$UP -H "Authorization: Bearer $TP"|j id)
chk "pai não lê dados de outro usuário" $(r GET /usuarios/$UB $TP) 403
chk "pai não acessa o admin" $(r GET /admin/resumo $TP) 403
chk "admin acessa o admin" $(r GET /admin/resumo $TA) 200
chk "pai cria agendamento" $(r POST /agendamentos $TP "{\"paiId\":$PAI,\"babaId\":1,\"dataServico\":\"$(date +%F)\",\"horaInicio\":\"08:00\",\"horaFim\":\"10:00\",\"endereco\":\"Rua Teste 1\",\"quantidadeCriancas\":1}") 200
AG=$(j id </tmp/r.json)
chk "pai cria 2º agendamento" $(r POST /agendamentos $TP "{\"paiId\":$PAI,\"babaId\":1,\"dataServico\":\"$(date +%F)\",\"horaInicio\":\"12:00\",\"horaFim\":\"13:00\",\"endereco\":\"Rua Teste 2\",\"quantidadeCriancas\":1}\") 200
AG2=$(j id </tmp/r.json)
chk "avaliar atendimento não concluído é recusado" $(r POST /avaliacoes $TP "{\"agendamentoId\":$AG2,\"nota\":5}") 400
chk "babá não gera código" $(r POST /atendimentos/$AG/codigo $TB) 403
chk "pai gera código" $(r POST /atendimentos/$AG/codigo $TP) 200
COD=$(j texto </tmp/r.json)
chk "código errado é recusado" $(r POST /atendimentos/$AG/checkin $TB '{"codigo":"000000"}') 400
chk "babá confirma chegada" $(r POST /atendimentos/$AG/checkin $TB "{\"codigo\":\"$COD\"}") 200
chk "babá registra diário" $(r POST /atendimentos/$AG/diario $TB '{"texto":"Comeu"}') 200
chk "pai não registra diário" $(r POST /atendimentos/$AG/diario $TP '{"texto":"x"}') 403
chk "pai paga (simulado)" $(r POST /atendimentos/$AG/pagar $TP) 200
chk "SOS é registrado" $(r POST /atendimentos/$AG/sos $TP '{}') 200
chk "babá encerra" $(r POST /atendimentos/$AG/checkout $TB) 200
r GET /atendimentos/$AG/linha $TP >/dev/null; grep -q PAGTO_LIBERADO /tmp/r.json && chk "pagamento liberado no fim" 1 1 || chk "pagamento liberado no fim" 0 1
# --- segurança: avaliações, denúncias, conversas, sem token ---
chk "sem token recebe 401" $(curl -s -o /dev/null -w '%{http_code}' $B/favoritos) 401
chk "outro responsável não avalia atendimento alheio" $(r POST /avaliacoes $TR "{\"agendamentoId\":$AG,\"nota\":1}") 403
chk "babá não avalia" $(r POST /avaliacoes $TB "{\"agendamentoId\":$AG,\"nota\":5}") 403
chk "responsável avalia atendimento concluído" $(r POST /avaliacoes $TP "{\"agendamentoId\":$AG,\"nota\":5,\"comentario\":\"Ótima\",\"pontualidade\":true}") 200
chk "avaliação duplicada é recusada" $(r POST /avaliacoes $TP "{\"agendamentoId\":$AG,\"nota\":5}") 400
chk "denúncia sem motivo é recusada (400)" $(r POST /denuncias $TP '{"descricao":"x"}') 400
chk "denúncia válida" $(r POST /denuncias $TP '{"motivo":"Teste","descricao":"Denúncia de teste"}') 200
chk "babá não abre conversa" $(r POST /conversas $TB '{"babaId":1}') 403
chk "responsável abre conversa" $(r POST /conversas $TP '{"babaId":1}') 200
CID=$(j id </tmp/r.json)
chk "participante envia mensagem" $(r POST /mensagens $TP "{\"conversaId\":$CID,\"conteudo\":\"Olá\"}") 200
chk "participante lê a conversa" $(r GET /conversas/$CID/mensagens $TP) 200
chk "estranho não lê a conversa" $(r GET /conversas/$CID/mensagens $TR) 403
chk "estranho não envia na conversa" $(r POST /mensagens $TR "{\"conversaId\":$CID,\"conteudo\":\"x\"}") 403
echo "Resultado: $ok ok, $f falhas"; [ $f -eq 0 ]
