# Safe Babá

Plataforma que conecta famílias a babás. Backend em Spring Boot (JPA, Microsoft SQL Server, JWT) e frontend em **Angular 18**.

## Estrutura
- `src/` – backend Spring Boot (API em `/api`)
- `frontend/` – frontend Angular (rotas com `#`, ex.: `http://localhost:8080/#/babas`)
- `legacy-static/` – telas HTML antigas, guardadas só como referência (não são servidas)

## Requisitos
- Java 17 ou superior (o Maven vem pelo wrapper `mvnw`)
- Node.js 18.19+ ou 20+ (só para compilar/rodar o frontend)

## Rodar tudo em uma porta (recomendado para a apresentação)
1. Compile o frontend uma vez: `build-frontend.bat` (Windows) ou `bash build-frontend.sh`.
   O resultado vai para `src/main/resources/static`.
2. Suba o backend:
   - Windows: `.\mvnw.cmd spring-boot:run`
   - Linux/macOS: `./mvnw spring-boot:run`
3. Abra `http://localhost:8080`.

## Rodar em modo desenvolvimento (recarrega ao salvar)
1. Backend: `.\mvnw.cmd spring-boot:run`
2. Em outro terminal: `cd frontend`, `npm install`, `npm start`
3. Abra `http://localhost:4200` (as chamadas `/api` são repassadas ao backend pela `proxy.conf.json`).

## Chave do JWT
Não há mais chave dentro do repositório. Para manter os logins entre reinicializações, defina antes de subir o backend:
```powershell
$env:APP_JWT_SECRET = "<texto em Base64 com 32 bytes ou mais>"
```
Para gerar uma: `[Convert]::ToBase64String((1..48 | % { Get-Random -Maximum 256 }))`.
Sem a variável, o servidor cria uma chave aleatória a cada execução (os logins caem ao reiniciar).
CORS: `APP_CORS_ORIGENS` (padrão: `http://localhost:4200,http://localhost:8080`).

## Contas de demonstração (senha 123456; somente com APP_SEED_ENABLED=true)
`pai@demo.com`, `rafael@demo.com`, `juliana@demo.com`, `ana@demo.com` (babá), `bia@demo.com`, `elisa@demo.com`, `admin@demo.com`.
Os dados fictícios são desativados por padrão. Ative `APP_SEED_ENABLED=true` somente em banco de teste/demonstração.

## Executar no SQL Server Express instalado neste computador

Como o ambiente local foi identificado como SQL Server 2016 Express, instância `SQLEXPRESS`,
com o login `safebaba_app`, use o inicializador abaixo na raiz do projeto:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\\executar-local-sqlserver.ps1
```

O script solicita o login e a senha no terminal (não grava a senha no projeto), configura
a URL da instância `SQLEXPRESS` e inicia o Spring Boot. Ele pressupõe que o banco `safebaba`
e o login `safebaba_app` já foram criados no SSMS e que o serviço SQL Server Browser está
em execução. `trustServerCertificate=true` é usado apenas para desenvolvimento local.

## Banco de dados: Microsoft SQL Server (único suportado)

H2 e MySQL foram removidos. A aplicação usa exclusivamente o driver JDBC oficial da Microsoft.

1. No SSMS, execute `database/create-database.sql` para criar o banco `safebaba` (se ainda não existir).
2. Configure as variáveis de ambiente `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`.
3. Inicie a aplicação com `.\mvnw.cmd spring-boot:run`.

Exemplo PowerShell (substitua servidor, usuário e senha pelos dados fornecidos pela TI):

```powershell
$env:DB_URL = "jdbc:sqlserver://SERVIDOR:1433;databaseName=safebaba;encrypt=true;trustServerCertificate=false"
$env:DB_USERNAME = "usuario_aplicacao"
$env:DB_PASSWORD = "senha"
$env:APP_JWT_SECRET = "<chave Base64 com 32 bytes ou mais>"
```

`DB_URL` pode ser adaptada para a porta/instância configurada no SQL Server. O acesso ao servidor da empresa fora da rede corporativa exige VPN ou outro meio remoto aprovado pela TI. Não exponha a porta 1433 diretamente à internet.

O Hibernate está configurado com `ddl-auto=update` para criar/atualizar tabelas ao iniciar. Faça backup e valide o esquema antes de usar em produção. Dados fictícios estão desativados por padrão; para um ambiente de demonstração, defina `APP_SEED_ENABLED=true` (nunca em produção).

Documentação: [Microsoft JDBC Driver para SQL Server](https://learn.microsoft.com/pt-br/sql/connect/jdbc/microsoft-jdbc-driver-for-sql-server) e [conexões criptografadas](https://learn.microsoft.com/pt-br/sql/connect/jdbc/connecting-with-ssl-encryption).

## Testes de ponta a ponta
Com o servidor rodando: `bash testar.sh` (cobre permissões, atendimento, avaliações, denúncias e conversas).


