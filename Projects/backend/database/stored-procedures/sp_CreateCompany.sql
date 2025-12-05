IF OBJECT_ID('sp_CreateCompany', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateCompany;
GO

CREATE PROCEDURE sp_CreateCompany
  @external_id NVARCHAR(100) = NULL,
  @name NVARCHAR(255),
  @address NVARCHAR(500) = NULL,
  @phone NVARCHAR(50) = NULL,
  @email NVARCHAR(255) = NULL,
  @contact_person NVARCHAR(255) = NULL,
  @contact_phone NVARCHAR(50) = NULL,
  @website NVARCHAR(512) = NULL,
  @description NVARCHAR(MAX) = NULL,
  @is_active BIT = 1,
  @company_type NVARCHAR(250) = NULL,
  @manager_name NVARCHAR(250) = NULL,
  @manager_phone VARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.companies
    (
    external_id, name, address, phone, email, contact_person, contact_phone, website, description, is_active, company_type, manager_name, manager_phone
    )
  VALUES
    (
      @external_id, @name, @address, @phone, @email, @contact_person, @contact_phone, @website, @description, @is_active, @company_type, @manager_name, @manager_phone
    );

  SELECT *
  FROM dbo.companies
  WHERE id = SCOPE_IDENTITY();
END
GO
