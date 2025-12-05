IF OBJECT_ID('sp_GetCompanyById', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetCompanyById;
GO

CREATE PROCEDURE sp_GetCompanyById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT *
  FROM dbo.companies
  WHERE id = @id;
END
GO
