# Implementação: consulta pública de disponibilidade

## Alterações
- Criado GET público `/api/babas/{id}/disponibilidade?inicio=AAAA-MM-DD&fim=AAAA-MM-DD`.
- O endpoint retorna somente horários semanais, períodos bloqueados e faixas de agendamentos pendentes/aceitos, sem dados de clientes ou motivos de bloqueio.
- Incluída consulta no ApiService Angular.
- Perfil público da babá agora apresenta disponibilidade para os próximos 30 dias e separa períodos ocupados/bloqueados.
- Botão de agendamento encaminha data e faixa horária escolhida como query params; formulário de agendamento pré-preenche esses campos.
- O `SecurityConfig` existente já permite GET em `/api/babas/**`, mantendo os demais métodos protegidos conforme as regras existentes.

## Validação
- ZIP será conferido quanto à integridade.
- Não foi possível executar o build Maven neste ambiente: o Maven Wrapper não conseguiu baixar Maven de repo.maven.apache.org. Portanto, o build completo ainda precisa ser executado no computador de desenvolvimento (`.\mvnw.cmd -DskipTests compile` e `npm install` / `npm run build` em `frontend`).
