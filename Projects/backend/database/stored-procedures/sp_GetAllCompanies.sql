IF OBJECT_ID('sp_GetAllCompanies', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetAllCompanies;
GO

CREATE PROCEDURE sp_GetAllCompanies
  @is_active BIT = NULL,
  @company_type NVARCHAR(250) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT *
  FROM dbo.companies
  WHERE (@is_active IS NULL OR is_active = @is_active)
    AND (@company_type IS NULL OR company_type = @company_type)
  ORDER BY name;
END
GO
