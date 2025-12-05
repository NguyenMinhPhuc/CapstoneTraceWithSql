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
        external_id = COALESCE(@external_id, external_id),
        name = COALESCE(@name, name),
        address = COALESCE(@address, address),
        phone = COALESCE(@phone, phone),
        email = COALESCE(@email, email),
        contact_person = COALESCE(@contact_person, contact_person),
        contact_phone = COALESCE(@contact_phone, contact_phone),
        website = COALESCE(@website, website),
        description = COALESCE(@description, description),
        is_active = COALESCE(@is_active, is_active),
        company_type = COALESCE(@company_type, company_type),
        manager_name = COALESCE(@manager_name, manager_name),
        manager_phone = COALESCE(@manager_phone, manager_phone),
        updated_at = SYSUTCDATETIME()
    WHERE id = @id;

  SELECT *
  FROM dbo.companies
  WHERE id = @id;
END
GO
