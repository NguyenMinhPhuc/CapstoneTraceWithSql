/*****************************************************
 * Stored Procedures: Academic Structure Management
 * Date: 2025-12-04
 * Description: CRUD operations for departments, majors, and classes
 *****************************************************/

SET NOCOUNT ON;
GO

-- =====================================================
-- DEPARTMENTS PROCEDURES
-- =====================================================

-- Get all departments
IF OBJECT_ID('dbo.sp_GetAllDepartments', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllDepartments;
GO
CREATE PROCEDURE dbo.sp_GetAllDepartments
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id,
    code,
    name,
    description,
    head_name,
    head_email,
    head_phone,
    is_active,
    created_at,
    updated_at
  FROM dbo.departments
  WHERE (@is_active IS NULL OR is_active = @is_active)
  ORDER BY name;
END
GO

-- Get department by ID
IF OBJECT_ID('dbo.sp_GetDepartmentById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetDepartmentById;
GO
CREATE PROCEDURE dbo.sp_GetDepartmentById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    id,
    code,
    name,
    description,
    head_name,
    head_email,
    head_phone,
    is_active,
    created_at,
    updated_at
  FROM dbo.departments
  WHERE id = @id;
END
GO

-- Create department
IF OBJECT_ID('dbo.sp_CreateDepartment', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateDepartment;
GO
CREATE PROCEDURE dbo.sp_CreateDepartment
  @code NVARCHAR(20),
  @name NVARCHAR(255),
  @description NVARCHAR(MAX) = NULL,
  @head_name NVARCHAR(255) = NULL,
  @head_email NVARCHAR(255) = NULL,
  @head_phone NVARCHAR(20) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.departments
    (code, name, description, head_name, head_email, head_phone, is_active)
  VALUES
    (@code, @name, @description, @head_name, @head_email, @head_phone, @is_active);

  SELECT
    id,
    code,
    name,
    description,
    head_name,
    head_email,
    head_phone,
    is_active,
    created_at,
    updated_at
  FROM dbo.departments
  WHERE id = SCOPE_IDENTITY();
END
GO

-- Update department
IF OBJECT_ID('dbo.sp_UpdateDepartment', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateDepartment;
GO
CREATE PROCEDURE dbo.sp_UpdateDepartment
  @id INT,
  @code NVARCHAR(20),
  @name NVARCHAR(255),
  @description NVARCHAR(MAX) = NULL,
  @head_name NVARCHAR(255) = NULL,
  @head_email NVARCHAR(255) = NULL,
  @head_phone NVARCHAR(20) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.departments
  SET 
    code = @code,
    name = @name,
    description = @description,
    head_name = @head_name,
    head_email = @head_email,
    head_phone = @head_phone,
    is_active = @is_active,
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT
    id,
    code,
    name,
    description,
    head_name,
    head_email,
    head_phone,
    is_active,
    created_at,
    updated_at
  FROM dbo.departments
  WHERE id = @id;
END
GO

-- Delete department
IF OBJECT_ID('dbo.sp_DeleteDepartment', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteDepartment;
GO
CREATE PROCEDURE dbo.sp_DeleteDepartment
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if department has majors
  IF EXISTS (SELECT 1
  FROM dbo.majors
  WHERE department_id = @id)
  BEGIN
    RAISERROR('Cannot delete department with existing majors. Please reassign or delete majors first.', 16, 1);
    RETURN;
  END

  DELETE FROM dbo.departments WHERE id = @id;
END
GO

-- =====================================================
-- MAJORS PROCEDURES
-- =====================================================

-- Get all majors
IF OBJECT_ID('dbo.sp_GetAllMajors', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllMajors;
GO
CREATE PROCEDURE dbo.sp_GetAllMajors
  @department_id INT = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    m.id,
    m.code,
    m.name,
    m.description,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    m.is_active,
    m.created_at,
    m.updated_at
  FROM dbo.majors m
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE (@department_id IS NULL OR m.department_id = @department_id)
    AND (@is_active IS NULL OR m.is_active = @is_active)
  ORDER BY m.name;
END
GO

-- Get major by ID
IF OBJECT_ID('dbo.sp_GetMajorById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetMajorById;
GO
CREATE PROCEDURE dbo.sp_GetMajorById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    m.id,
    m.code,
    m.name,
    m.description,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    m.is_active,
    m.created_at,
    m.updated_at
  FROM dbo.majors m
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE m.id = @id;
END
GO

-- Create major
IF OBJECT_ID('dbo.sp_CreateMajor', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateMajor;
GO
CREATE PROCEDURE dbo.sp_CreateMajor
  @code NVARCHAR(20),
  @name NVARCHAR(255),
  @description NVARCHAR(MAX) = NULL,
  @department_id INT = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.majors
    (code, name, description, department_id, is_active)
  VALUES
    (@code, @name, @description, @department_id, @is_active);

  DECLARE @new_id INT = SCOPE_IDENTITY();

  SELECT
    m.id,
    m.code,
    m.name,
    m.description,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    m.is_active,
    m.created_at,
    m.updated_at
  FROM dbo.majors m
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE m.id = @new_id;
END
GO

-- Update major
IF OBJECT_ID('dbo.sp_UpdateMajor', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateMajor;
GO
CREATE PROCEDURE dbo.sp_UpdateMajor
  @id INT,
  @code NVARCHAR(20),
  @name NVARCHAR(255),
  @description NVARCHAR(MAX) = NULL,
  @department_id INT = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.majors
  SET 
    code = @code,
    name = @name,
    description = @description,
    department_id = @department_id,
    is_active = @is_active,
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT
    m.id,
    m.code,
    m.name,
    m.description,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    m.is_active,
    m.created_at,
    m.updated_at
  FROM dbo.majors m
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE m.id = @id;
END
GO

-- Delete major
IF OBJECT_ID('dbo.sp_DeleteMajor', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteMajor;
GO
CREATE PROCEDURE dbo.sp_DeleteMajor
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if major has classes or students
  IF EXISTS (SELECT 1
  FROM dbo.classes
  WHERE major_id = @id)
  BEGIN
    RAISERROR('Cannot delete major with existing classes. Please reassign or delete classes first.', 16, 1);
    RETURN;
  END

  IF EXISTS (SELECT 1
  FROM dbo.students
  WHERE major_id = @id)
  BEGIN
    RAISERROR('Cannot delete major with existing students. Please reassign or delete students first.', 16, 1);
    RETURN;
  END

  DELETE FROM dbo.majors WHERE id = @id;
END
GO

-- =====================================================
-- CLASSES PROCEDURES
-- =====================================================

-- Get all classes
IF OBJECT_ID('dbo.sp_GetAllClasses', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetAllClasses;
GO
CREATE PROCEDURE dbo.sp_GetAllClasses
  @major_id INT = NULL,
  @academic_year NVARCHAR(20) = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    c.id,
    c.code,
    c.name,
    c.major_id,
    m.name as major_name,
    m.code as major_code,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    c.academic_year,
    c.is_active,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*)
    FROM dbo.students
    WHERE class_id = c.id) as student_count
  FROM dbo.classes c
    LEFT JOIN dbo.majors m ON c.major_id = m.id
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE (@major_id IS NULL OR c.major_id = @major_id)
    AND (@academic_year IS NULL OR c.academic_year = @academic_year)
    AND (@is_active IS NULL OR c.is_active = @is_active)
  ORDER BY c.academic_year DESC, c.name;
END
GO

-- Get class by ID
IF OBJECT_ID('dbo.sp_GetClassById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetClassById;
GO
CREATE PROCEDURE dbo.sp_GetClassById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    c.id,
    c.code,
    c.name,
    c.major_id,
    m.name as major_name,
    m.code as major_code,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    c.academic_year,
    c.is_active,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*)
    FROM dbo.students
    WHERE class_id = c.id) as student_count
  FROM dbo.classes c
    LEFT JOIN dbo.majors m ON c.major_id = m.id
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE c.id = @id;
END
GO

-- Create class
IF OBJECT_ID('dbo.sp_CreateClass', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateClass;
GO
CREATE PROCEDURE dbo.sp_CreateClass
  @code NVARCHAR(50),
  @name NVARCHAR(255),
  @major_id INT = NULL,
  @academic_year NVARCHAR(20) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.classes
    (code, name, major_id, academic_year, is_active)
  VALUES
    (@code, @name, @major_id, @academic_year, @is_active);

  DECLARE @new_id INT = SCOPE_IDENTITY();

  SELECT
    c.id,
    c.code,
    c.name,
    c.major_id,
    m.name as major_name,
    m.code as major_code,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    c.academic_year,
    c.is_active,
    c.created_at,
    c.updated_at,
    0 as student_count
  FROM dbo.classes c
    LEFT JOIN dbo.majors m ON c.major_id = m.id
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE c.id = @new_id;
END
GO

-- Update class
IF OBJECT_ID('dbo.sp_UpdateClass', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateClass;
GO
CREATE PROCEDURE dbo.sp_UpdateClass
  @id INT,
  @code NVARCHAR(50),
  @name NVARCHAR(255),
  @major_id INT = NULL,
  @academic_year NVARCHAR(20) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.classes
  SET 
    code = @code,
    name = @name,
    major_id = @major_id,
    academic_year = @academic_year,
    is_active = @is_active,
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT
    c.id,
    c.code,
    c.name,
    c.major_id,
    m.name as major_name,
    m.code as major_code,
    m.department_id,
    d.name as department_name,
    d.code as department_code,
    c.academic_year,
    c.is_active,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*)
    FROM dbo.students
    WHERE class_id = c.id) as student_count
  FROM dbo.classes c
    LEFT JOIN dbo.majors m ON c.major_id = m.id
    LEFT JOIN dbo.departments d ON m.department_id = d.id
  WHERE c.id = @id;
END
GO

-- Delete class
IF OBJECT_ID('dbo.sp_DeleteClass', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteClass;
GO
CREATE PROCEDURE dbo.sp_DeleteClass
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if class has students
  IF EXISTS (SELECT 1
  FROM dbo.students
  WHERE class_id = @id)
  BEGIN
    RAISERROR('Cannot delete class with existing students. Please reassign or delete students first.', 16, 1);
    RETURN;
  END

  DELETE FROM dbo.classes WHERE id = @id;
END
GO

PRINT 'Academic structure stored procedures created successfully.';
GO
