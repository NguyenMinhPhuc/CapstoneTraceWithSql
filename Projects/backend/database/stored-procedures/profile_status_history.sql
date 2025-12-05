-- ============================
-- Stored Procedures for Profile Status History
-- Purpose: Manage student profile status change history
-- ============================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================
-- SP: Add Status History Record
-- ============================
IF OBJECT_ID('dbo.sp_AddProfileStatusHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AddProfileStatusHistory;
GO

CREATE PROCEDURE dbo.sp_AddProfileStatusHistory
  @student_id INT,
  @old_status NVARCHAR(50) = NULL,
  @new_status NVARCHAR(50),
  @changed_by NVARCHAR(50),
  @notes NVARCHAR(MAX) = NULL,
  @change_type NVARCHAR(50) = 'status_change'
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        -- Validate student exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.students
  WHERE id = @student_id)
        BEGIN
    RAISERROR('Student with ID %d does not exist', 16, 1, @student_id);
    RETURN;
  END
        
        -- Validate user exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.[users]
  WHERE id = @changed_by)
        BEGIN
    RAISERROR('User with ID %s does not exist', 16, 1, @changed_by);
    RETURN;
  END
        
        -- Insert history record
        INSERT INTO dbo.profile_status_history
    (student_id, old_status, new_status, changed_by, notes, change_type)
  VALUES
    (@student_id, @old_status, @new_status, @changed_by, @notes, @change_type);
        
        -- Return the inserted record
        SELECT
    id,
    student_id,
    old_status,
    new_status,
    changed_by,
    changed_at,
    notes,
    change_type
  FROM dbo.profile_status_history
  WHERE id = SCOPE_IDENTITY();
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- ============================
-- SP: Get Status History by Student ID
-- ============================
IF OBJECT_ID('dbo.sp_GetProfileStatusHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetProfileStatusHistory;
GO

CREATE PROCEDURE dbo.sp_GetProfileStatusHistory
  @student_id INT,
  @limit INT = 100,
  @offset INT = 0
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        -- Return history records with user information
        SELECT
    h.id,
    h.student_id,
    h.old_status,
    h.new_status,
    h.changed_by,
    u.full_name AS changed_by_name,
    u.email AS changed_by_email,
    h.changed_at,
    h.notes,
    h.change_type,
    h.created_at
  FROM dbo.profile_status_history h
    INNER JOIN dbo.[users] u ON h.changed_by = u.id
  WHERE h.student_id = @student_id
  ORDER BY h.changed_at DESC, h.id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;
        
        -- Return total count
        SELECT COUNT(*) AS total_count
  FROM dbo.profile_status_history
  WHERE student_id = @student_id;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- ============================
-- SP: Get All Status History (for admin reporting)
-- ============================
IF OBJECT_ID('dbo.sp_GetAllProfileStatusHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetAllProfileStatusHistory;
GO

CREATE PROCEDURE dbo.sp_GetAllProfileStatusHistory
  @start_date DATETIME2 = NULL,
  @end_date DATETIME2 = NULL,
  @change_type NVARCHAR(50) = NULL,
  @limit INT = 100,
  @offset INT = 0
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        -- Return history records with student and user information
        SELECT
    h.id,
    h.student_id,
    s.student_code,
    su.full_name AS student_name,
    h.old_status,
    h.new_status,
    h.changed_by,
    u.full_name AS changed_by_name,
    u.role AS changed_by_role,
    h.changed_at,
    h.notes,
    h.change_type
  FROM dbo.profile_status_history h
    INNER JOIN dbo.students s ON h.student_id = s.id
    INNER JOIN dbo.[users] su ON s.user_id = su.id
    INNER JOIN dbo.[users] u ON h.changed_by = u.id
  WHERE 
            (@start_date IS NULL OR h.changed_at >= @start_date)
    AND (@end_date IS NULL OR h.changed_at <= @end_date)
    AND (@change_type IS NULL OR h.change_type = @change_type)
  ORDER BY h.changed_at DESC, h.id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;
        
        -- Return total count
        SELECT COUNT(*) AS total_count
  FROM dbo.profile_status_history h
  WHERE 
            (@start_date IS NULL OR h.changed_at >= @start_date)
    AND (@end_date IS NULL OR h.changed_at <= @end_date)
    AND (@change_type IS NULL OR h.change_type = @change_type);
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'Profile status history stored procedures created successfully';
GO
