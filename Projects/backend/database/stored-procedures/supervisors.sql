-- =======================
-- SUPERVISORS / LECTURERS STORED PROCEDURES
-- =======================
-- NOTE: This file defines procedures for supervisors (renamed to lecturers).
-- The `lecturer_type` column is expected to exist on the `supervisors` table.

SET NOCOUNT ON;

-- Get all supervisors (lecturers)
IF OBJECT_ID('dbo.sp_GetAllSupervisors', 'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_GetAllSupervisors;
GO
CREATE PROCEDURE dbo.sp_GetAllSupervisors
  @department INT = NULL,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    s.id, 
    GO

    -- Get all supervisors
    GO
CREATE OR ALTER PROCEDURE sp_GetAllSupervisors
  @department INT = NULL,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    s.id,
    s.user_id,
    s.department,
    s.lecturer_type,
    s.title,
    s.max_students,
    s.current_students,
    s.specializations,
    s.created_at,
    s.updated_at,
    u.email,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.is_active
  FROM supervisors s
    INNER JOIN [users] u ON s.user_id = u.id
  WHERE ( @department IS NULL OR s.department = @department )
    AND ( @lecturer_type IS NULL OR s.lecturer_type = @lecturer_type )
    AND ( @title IS NULL OR s.title = @title )
  ORDER BY u.full_name;
END;
   
GO

-- Create supervisor (lecturer)
IF OBJECT_ID('dbo.sp_CreateSupervisor', 'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_CreateSupervisor;
GO
CREATE PROCEDURE dbo.sp_CreateSupervisor
  @supervisor_id NVARCHAR(50),
  @user_id NVARCHAR(50),
  @email NVARCHAR(255),
  @password_hash NVARCHAR(500),
  @full_name NVARCHAR(255),
  @phone NVARCHAR(20) = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @department INT,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100),
  @max_students INT = 10,
  @specializations NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    -- Check if email already exists
    IF EXISTS (SELECT 1
  FROM [users]
  WHERE email = @email)
    BEGIN
      THROW 50002, 'Email already exists', 1;
    END

    -- Create user
    INSERT INTO [users]
    (id, email, password_hash, password_algo, password_version, full_name, role, phone, avatar_url, is_active, created_at, updated_at)
  VALUES
    (@user_id, @email, @password_hash, 'bcrypt', 1, @full_name, 'supervisor', @phone, @avatar_url, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

    -- Create supervisor record
    INSERT INTO supervisors
    (id, user_id, department, lecturer_type, title, max_students, current_students, specializations, created_at, updated_at)
  VALUES
    (@supervisor_id, @user_id, @department, @lecturer_type, @title, @max_students, 0, @specializations, GETDATE(), GETDATE());

    -- Return created record (including joined user fields)
    SELECT
    s.id,
    s.user_id,
    s.department,
    s.lecturer_type,
    s.title,
    s.max_students,
    s.current_students,
    s.specializations,
    s.created_at,
    s.updated_at,
    u.email,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.is_active
  FROM supervisors s
    INNER JOIN [users] u ON s.user_id = u.id
  WHERE s.id = @supervisor_id;

    COMMIT TRANSACTION;
  END
  TRY
  BEGIN CATCH
  IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
  THROW;
  END CATCH
END;
GO

-- Update supervisor (lecturer)
IF OBJECT_ID('dbo.sp_UpdateSupervisor', 'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_UpdateSupervisor;
GO
CREATE PROCEDURE dbo.sp_UpdateSupervisor
  @id NVARCHAR(50),
  @email NVARCHAR(255) = NULL,
  @full_name NVARCHAR(255) = NULL,
  @phone NVARCHAR(20) = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @department NVARCHAR(255) = NULL,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100) = NULL,
  @max_students INT = NULL,
  @specializations NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  -- Check existence
  IF NOT EXISTS (SELECT 1
  FROM supervisors
  WHERE id = @id)
  BEGIN
  THROW 50003, 'Supervisor not found', 1;
END

DECLARE @user_id NVARCHAR(50);
SELECT @user_id = user_id
FROM supervisors
WHERE id = @id;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Update user info if provided
    IF @email IS NOT NULL OR @full_name IS NOT NULL OR @phone IS NOT NULL OR @avatar_url IS NOT NULL
    BEGIN
  UPDATE [users]
      SET
        email = ISNULL(@email, email),
        full_name = ISNULL(@full_name, full_name),
        phone = ISNULL(@phone, phone),
        avatar_url = ISNULL(@avatar_url, avatar_url),
        updated_at = SYSUTCDATETIME()
      WHERE id = @user_id;
END

    -- Update supervisor fields
    UPDATE supervisors
    SET
      department = ISNULL(@department, department),
      lecturer_type = ISNULL(@lecturer_type, lecturer_type),
      title = ISNULL(@title, title),
      max_students = ISNULL(@max_students, max_students),
      specializations = ISNULL(@specializations, specializations),
      updated_at = GETDATE()
    WHERE id = @id;

    -- Return updated record
    SELECT
  s.id,
  s.user_id,
  s.department,
  s.lecturer_type,
  s.title,
  s.max_students,
  s.current_students,
  s.specializations,
  s.created_at,
  s.updated_at,
  u.email,
  u.full_name,
  u.phone,
  u.avatar_url,
  u.is_active
FROM supervisors s
  INNER JOIN [users] u ON s.user_id = u.id
WHERE s.id = @id;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;
GO

-- Delete supervisor (lecturer)
IF OBJECT_ID('dbo.sp_DeleteSupervisor', 'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_DeleteSupervisor;
GO
CREATE PROCEDURE dbo.sp_DeleteSupervisor
  @id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1
  FROM supervisors
  WHERE id = @id)
  BEGIN
  THROW 50003, 'Supervisor not found', 1;
END

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @user_id NVARCHAR(50);
    SELECT @user_id = user_id
FROM supervisors
WHERE id = @id;

    DELETE FROM supervisors WHERE id = @id;
    DELETE FROM [users] WHERE id = @user_id;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;
GO
-- =======================
-- SUPERVISORS STORED PROCEDURES
-- =======================
-- NOTE: Added `lecturer_type` (e.g. 'Giảng viên LHU' or 'Giảng viên thỉnh giảng')

-- Get all supervisors
GO
CREATE OR ALTER PROCEDURE sp_GetAllSupervisors
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    s.id,
    s.user_id,
    s.department,
    s.lecturer_type,
    s.title,
    s.max_students,
    s.current_students,
    s.specializations,
    s.created_at,
    s.updated_at,
    u.email,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.is_active
  FROM supervisors s
    INNER JOIN [users] u ON s.user_id = u.id
  ORDER BY u.full_name;
END;
GO

-- Get supervisor by ID
GO
CREATE OR ALTER PROCEDURE sp_GetSupervisorById
  @id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    s.id,
    s.user_id,
    s.department,
    s.lecturer_type,
    s.title,
    s.max_students,
    s.current_students,
    s.specializations,
    s.created_at,
    s.updated_at,
    u.email,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.is_active
  FROM supervisors s
    INNER JOIN [users] u ON s.user_id = u.id
  WHERE s.id = @id;
END;
GO

-- Create lecturer
GO
CREATE OR ALTER PROCEDURE sp_CreateSupervisor
  @supervisor_id NVARCHAR(50),
  @user_id NVARCHAR(50),
  @email NVARCHAR(255),
  @password_hash NVARCHAR(500),
  @full_name NVARCHAR(255),
  @phone NVARCHAR(20) = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @department INT,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100),
  @max_students INT = 10,
  @specializations NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Check if email already exists
    IF EXISTS (SELECT 1
  FROM [users]
  WHERE email = @email)
    BEGIN
        THROW 50002, 'Email already exists', 1;
    END;

    -- Create user account
    INSERT INTO [users]
    (id, email, password_hash, password_algo, password_version, full_name, role, phone, avatar_url, is_active, created_at, updated_at)
  VALUES
    (@user_id, @email, @password_hash, 'bcrypt', 1, @full_name, 'supervisor', @phone, @avatar_url, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

    -- Create supervisor record
    INSERT INTO supervisors
    (id, user_id, department, lecturer_type, title, max_students, current_students, specializations, created_at, updated_at)
  VALUES
    (@supervisor_id, @user_id, @department, @lecturer_type, @title, @max_students, 0, @specializations, GETDATE(), GETDATE());

    -- Return result
    SELECT
    s.id,
    s.user_id,
    s.department,
    s.title,
    s.max_students,
    s.current_students,
    s.specializations,
    s.created_at,
    s.updated_at,
    u.email,
    u.full_name,
    u.phone,
    u.avatar_url,
    u.is_active
  FROM supervisors s
    INNER JOIN [users] u ON s.user_id = u.id
  WHERE s.id = @supervisor_id;

    COMMIT TRANSACTION;
  END
  TRY
  BEGIN CATCH
  IF @@TRANCOUNT > 0
          ROLLBACK TRANSACTION;

  -- Rethrow original error
  THROW;
  END CATCH;
END;
GO


-- Update lecturer
CREATE OR ALTER PROCEDURE sp_UpdateSupervisor
  @id NVARCHAR(50),
  @email NVARCHAR(255) = NULL,
  @full_name NVARCHAR(255) = NULL,
  @phone NVARCHAR(20) = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @department INT = NULL,
  @lecturer_type NVARCHAR(100) = NULL,
  @title NVARCHAR(100) = NULL,
  @max_students INT = NULL,
  @specializations NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Check existence
  IF NOT EXISTS (SELECT 1
  FROM supervisors
  WHERE id = @id)
    BEGIN
  THROW 50003, 'Supervisor not found', 1;
END;

DECLARE @user_id NVARCHAR(50);
SELECT @user_id = user_id
FROM supervisors
WHERE id = @id;

BEGIN TRY
        BEGIN TRANSACTION;

        -- Update user
        IF @email IS NOT NULL
  OR @full_name IS NOT NULL
  OR @phone IS NOT NULL
  OR @avatar_url IS NOT NULL
        BEGIN
  UPDATE [users]
            SET
                email = ISNULL(@email, email),
                full_name = ISNULL(@full_name, full_name),
                phone = ISNULL(@phone, phone),
                avatar_url = ISNULL(@avatar_url, avatar_url),
                updated_at = SYSUTCDATETIME()
            WHERE id = @user_id;
END;

        -- Update supervisor
        UPDATE supervisors
        SET
            department = ISNULL(@department, department),
            lecturer_type = ISNULL(@lecturer_type, lecturer_type),
            title = ISNULL(@title, title),
            max_students = ISNULL(@max_students, max_students),
            specializations = ISNULL(@specializations, specializations),
            updated_at = GETDATE()
        WHERE id = @id;

        -- Return updated data
        SELECT
  s.id,
  s.user_id,
  s.department,
  s.title,
  s.max_students,
  s.current_students,
  s.specializations,
  s.created_at,
  s.updated_at,
  u.email,
  u.full_name,
  u.phone,
  u.avatar_url,
  u.is_active
FROM supervisors s
  INNER JOIN [users] u ON s.user_id = u.id
WHERE s.id = @id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO


-- Delete supervisor
GO
CREATE OR ALTER PROCEDURE sp_DeleteSupervisor
  @id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1
  FROM supervisors
  WHERE id = @id)
    BEGIN
  THROW 50004, 'Supervisor not found', 1;
END;

DECLARE @user_id NVARCHAR(50);
SELECT @user_id = user_id
FROM supervisors
WHERE id = @id;

BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM supervisors WHERE id = @id;

        DELETE FROM [users] WHERE id = @user_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

GO
