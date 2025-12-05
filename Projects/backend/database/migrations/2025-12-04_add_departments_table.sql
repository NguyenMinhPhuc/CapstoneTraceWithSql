/*****************************************************
 * Migration: Add departments table and update majors
 * Date: 2025-12-04
 * Description: 
 *   - Create departments table
 *   - Add department_id to majors table
 *   - Add indexes for performance
 *****************************************************/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

-- =======================
-- CREATE: DEPARTMENTS
-- =======================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'departments')
BEGIN
  CREATE TABLE dbo.departments
  (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(20) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    head_name NVARCHAR(255) NULL,
    head_email NVARCHAR(255) NULL,
    head_phone NVARCHAR(20) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowversion_col rowversion
  );

  CREATE NONCLUSTERED INDEX ix_departments_code ON dbo.departments(code);
  CREATE NONCLUSTERED INDEX ix_departments_active ON dbo.departments(is_active);

  PRINT 'Table departments created successfully.';
END
ELSE
BEGIN
  PRINT 'Table departments already exists.';
END
GO

-- =======================
-- UPDATE: MAJORS - Add department_id
-- =======================
IF NOT EXISTS (SELECT *
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.majors') AND name = 'department_id')
BEGIN
  ALTER TABLE dbo.majors 
    ADD department_id INT NULL,
    CONSTRAINT fk_majors_department FOREIGN KEY (department_id) REFERENCES dbo.departments(id) ON DELETE NO ACTION;

  CREATE NONCLUSTERED INDEX ix_majors_department ON dbo.majors(department_id);

  PRINT 'Column department_id added to majors table.';
END
ELSE
BEGIN
  PRINT 'Column department_id already exists in majors table.';
END
GO

-- =======================
-- UPDATE: MAJORS - Add additional fields
-- =======================
IF NOT EXISTS (SELECT *
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.majors') AND name = 'is_active')
BEGIN
  ALTER TABLE dbo.majors 
    ADD is_active BIT NOT NULL DEFAULT 1,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowversion_col rowversion;

  PRINT 'Additional columns added to majors table.';
END
ELSE
BEGIN
  PRINT 'Additional columns already exist in majors table.';
END
GO

-- =======================
-- UPDATE: CLASSES - Add additional fields
-- =======================
IF NOT EXISTS (SELECT *
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.classes') AND name = 'is_active')
BEGIN
  ALTER TABLE dbo.classes 
    ADD is_active BIT NOT NULL DEFAULT 1,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    rowversion_col rowversion;

  PRINT 'Additional columns added to classes table.';
END
ELSE
BEGIN
  PRINT 'Additional columns already exist in classes table.';
END
GO

PRINT 'Migration completed successfully.';
GO
