-- =======================
-- COMPANIES STORED PROCEDURES
-- =======================
SET NOCOUNT ON;

IF OBJECT_ID('dbo.sp_GetAllCompanies','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_GetAllCompanies;
GO
CREATE PROCEDURE dbo.sp_GetAllCompanies
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    c.id,
    c.name,
    c.address,
    c.phone,
    c.email,
    c.contact_person,
    c.contact_phone,
    c.website,
    c.description,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE ( @is_active IS NULL OR c.is_active = @is_active )
  ORDER BY c.name;
END;
GO

IF OBJECT_ID('dbo.sp_GetCompanyById','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_GetCompanyById;
GO
CREATE PROCEDURE dbo.sp_GetCompanyById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    c.id,
    c.name,
    c.address,
    c.phone,
    c.email,
    c.contact_person,
    c.contact_phone,
    c.website,
    c.description,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE c.id = @id;
END;
GO

IF OBJECT_ID('dbo.sp_CreateCompany','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_CreateCompany;
GO
CREATE PROCEDURE dbo.sp_CreateCompany
  @name NVARCHAR(255),
  @address NVARCHAR(500) = NULL,
  @phone NVARCHAR(20) = NULL,
  @email NVARCHAR(255) = NULL,
  @contact_person NVARCHAR(255) = NULL,
  @contact_phone NVARCHAR(20) = NULL,
  @website NVARCHAR(255) = NULL,
  @description NVARCHAR(MAX) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO companies
  (name,address,phone,email,contact_person,contact_phone,website,description,is_active,created_at,updated_at)
  VALUES
  (@name,@address,@phone,@email,@contact_person,@contact_phone,@website,@description,@is_active,GETDATE(),GETDATE());

  SELECT * FROM companies WHERE id = SCOPE_IDENTITY();
END;
GO

IF OBJECT_ID('dbo.sp_UpdateCompany','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_UpdateCompany;
GO
CREATE PROCEDURE dbo.sp_UpdateCompany
  @id INT,
  @name NVARCHAR(255) = NULL,
  @address NVARCHAR(500) = NULL,
  @phone NVARCHAR(20) = NULL,
  @email NVARCHAR(255) = NULL,
  @contact_person NVARCHAR(255) = NULL,
  @contact_phone NVARCHAR(20) = NULL,
  @website NVARCHAR(255) = NULL,
  @description NVARCHAR(MAX) = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = @id)
  BEGIN
    THROW 50010, 'Company not found', 1;
  END

  UPDATE companies
  SET
    name = ISNULL(@name, name),
    address = ISNULL(@address, address),
    phone = ISNULL(@phone, phone),
    email = ISNULL(@email, email),
    contact_person = ISNULL(@contact_person, contact_person),
    contact_phone = ISNULL(@contact_phone, contact_phone),
    website = ISNULL(@website, website),
    description = ISNULL(@description, description),
    is_active = ISNULL(@is_active, is_active),
    updated_at = GETDATE()
  WHERE id = @id;

  SELECT * FROM companies WHERE id = @id;
END;
GO

IF OBJECT_ID('dbo.sp_DeleteCompany','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_DeleteCompany;
GO
CREATE PROCEDURE dbo.sp_DeleteCompany
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = @id)
  BEGIN
    THROW 50011, 'Company not found', 1;
  END

  DELETE FROM companies WHERE id = @id;
END;
GO
