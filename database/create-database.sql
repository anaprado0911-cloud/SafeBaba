/*
  Execute este script no SQL Server Management Studio (SSMS) com uma conta
  autorizada a criar bancos de dados. Se o banco já existir, não é necessário
  executar novamente.

  Depois, configure DB_URL, DB_USERNAME e DB_PASSWORD para a aplicação.
*/
IF DB_ID(N'safebaba') IS NULL
BEGIN
    CREATE DATABASE [safebaba];
END;
GO
