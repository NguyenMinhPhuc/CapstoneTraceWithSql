-- ==========================================
-- Apply All Company Stored Procedures
-- Database: CapstoneTrack
-- Date: 2025-12-05
-- Description: This script creates/updates all stored procedures
-- for company management according to the schema defined in
-- 2025_12_05_create_companies_table.sql
-- ==========================================

USE CapstoneTrack;
GO

-- ==========================================
-- sp_CreateCompany
-- ==========================================
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

-- ==========================================
-- sp_UpdateCompany
-- ==========================================
IF OBJECT_ID('sp_UpdateCompany', 'P') IS NOT NULL
    DROP PROCEDURE sp_UpdateCompany;
GO

CREATE PROCEDURE sp_UpdateCompany
  @id INT,
  @external_id NVARCHAR(100) = NULL,
  @name NVARCHAR(255) = NULL,
  @address NVARCHAR(500) = NULL,
  @phone NVARCHAR(50) = NULL,
  @email NVARCHAR(255) = NULL,
  @contact_person NVARCHAR(255) = NULL,
  @contact_phone NVARCHAR(50) = NULL,
  @website NVARCHAR(512) = NULL,
  @description NVARCHAR(MAX) = NULL,
  @is_active BIT = NULL,
  @company_type NVARCHAR(250) = NULL,
  @manager_name NVARCHAR(250) = NULL,
  @manager_phone VARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.companies
  SET
    external_id = ISNULL(@external_id, external_id),
    name = ISNULL(@name, name),
    address = ISNULL(@address, address),
    phone = ISNULL(@phone, phone),
    email = ISNULL(@email, email),
    contact_person = ISNULL(@contact_person, contact_person),
    contact_phone = ISNULL(@contact_phone, contact_phone),
    website = ISNULL(@website, website),
    description = ISNULL(@description, description),
    is_active = ISNULL(@is_active, is_active),
    company_type = ISNULL(@company_type, company_type),
    manager_name = ISNULL(@manager_name, manager_name),
    manager_phone = ISNULL(@manager_phone, manager_phone),
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT *
  FROM dbo.companies
  WHERE id = @id;
END
GO

-- ==========================================
-- sp_GetAllCompanies
-- ==========================================
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
  WHERE
    (@is_active IS NULL OR is_active = @is_active)
    AND (@company_type IS NULL OR company_type = @company_type)
  ORDER BY created_at DESC;
END
GO

-- ==========================================
-- sp_GetCompanyById
-- ==========================================
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

-- ==========================================
-- sp_DeleteCompany
-- ==========================================
IF OBJECT_ID('sp_DeleteCompany', 'P') IS NOT NULL
    DROP PROCEDURE sp_DeleteCompany;
GO

CREATE PROCEDURE sp_DeleteCompany
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.companies
  WHERE id = @id;
END
GO

-- ==========================================
-- Verification
-- ==========================================
PRINT '===========================================';
PRINT 'All company stored procedures have been created/updated successfully!';
PRINT '===========================================';
PRINT 'Procedures created:';
PRINT '  - sp_CreateCompany';
PRINT '  - sp_UpdateCompany';
PRINT '  - sp_GetAllCompanies';
PRINT '  - sp_GetCompanyById';
PRINT '  - sp_DeleteCompany';
PRINT '===========================================';

-- List all company procedures
SELECT OBJECT_NAME(id) as ProcedureName
FROM sys.sysobjects
WHERE type = 'P'
  AND OBJECT_NAME(id) LIKE 'sp_%Company%'
ORDER BY OBJECT_NAME(id);
