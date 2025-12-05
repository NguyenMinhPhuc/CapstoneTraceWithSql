IF OBJECT_ID('sp_DeleteCompany', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteCompany;
GO

CREATE PROCEDURE sp_DeleteCompany
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.companies WHERE id = @id;
END
GO
