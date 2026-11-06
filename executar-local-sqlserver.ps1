# SafeBaba - inicializacao com SQL Server
$ErrorActionPreference = "Stop"

Write-Host "SafeBaba - Conexao com SQL Server" -ForegroundColor Cyan
Write-Host ""
Write-Host "1 - Computador da escola (D9995NE708)"
Write-Host "2 - Computador de casa (SQLEXPRESS)"
Write-Host ""

$opcao = Read-Host "Escolha o computador (1 ou 2)"

if ($opcao -eq "1") {
    $servidor = "D9995NE708"
    $env:DB_URL = "jdbc:sqlserver://D9995NE708;databaseName=safebaba;encrypt=true;trustServerCertificate=true"
}
elseif ($opcao -eq "2") {
    $servidor = "localhost;instanceName=SQLEXPRESS"
    $env:DB_URL = "jdbc:sqlserver://localhost;instanceName=SQLEXPRESS;databaseName=safebaba;encrypt=true;trustServerCertificate=true"
}
else {
    Write-Host "Opcao invalida." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Servidor: $servidor"
Write-Host "Banco: safebaba"
Write-Host ""

$login = Read-Host "Login SQL"
$securePassword = Read-Host "Senha SQL" -AsSecureString

$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    $env:DB_USERNAME = $login
    $env:DB_PASSWORD = $password

    if (-not $env:APP_JWT_SECRET) {
        $bytes = New-Object byte[] 48
        [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
        $env:APP_JWT_SECRET = [Convert]::ToBase64String($bytes)
    }

    Write-Host ""
    Write-Host "Iniciando o SafeBaba..." -ForegroundColor Green

    .\mvnw.cmd spring-boot:run
}
finally {
    $password = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:DB_USERNAME -ErrorAction SilentlyContinue
    Remove-Item Env:DB_URL -ErrorAction SilentlyContinue
}