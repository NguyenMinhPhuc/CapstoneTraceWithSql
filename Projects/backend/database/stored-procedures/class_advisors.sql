-- ============================
-- Stored Procedures for Class Advisors Management
-- Purpose: Manage homeroom teacher assignments and advisor profiles
-- ============================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================
-- SP: Assign Class Advisor
-- ============================
IF OBJECT_ID('dbo.sp_AssignClassAdvisor', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AssignClassAdvisor;
GO

CREATE PROCEDURE dbo.sp_AssignClassAdvisor
  @class_id INT,
  @teacher_id NVARCHAR(50),
  @teacher_type NVARCHAR(20) = 'supervisor',
  @semester NVARCHAR(20),
  @academic_year NVARCHAR(20),
  @assigned_by NVARCHAR(50) = NULL,
  @notes NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validate class exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.classes
  WHERE id = @class_id)
        BEGIN
    RAISERROR('Class with ID %d does not exist', 16, 1, @class_id);
    RETURN;
  END
        
        -- Validate teacher exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.[users]
  WHERE id = @teacher_id)
        BEGIN
    RAISERROR('Teacher with ID %s does not exist', 16, 1, @teacher_id);
    RETURN;
  END
        
        -- Deactivate previous active assignments for this class in same semester/year
        UPDATE dbo.class_advisors
        SET is_active = 0,
            end_date = SYSUTCDATETIME(),
            updated_at = SYSUTCDATETIME()
        WHERE class_id = @class_id
    AND semester = @semester
    AND academic_year = @academic_year
    AND is_active = 1;
        
        -- Insert new assignment
        INSERT INTO dbo.class_advisors
    (class_id, teacher_id, teacher_type, semester, academic_year,
    assigned_by, notes, is_active)
  VALUES
    (@class_id, @teacher_id, @teacher_type, @semester, @academic_year,
      @assigned_by, @notes, 1);
        
        COMMIT TRANSACTION;
        
        -- Return the new assignment
        SELECT
    ca.id,
    ca.class_id,
    c.name AS class_name,
    c.code AS class_code,
    ca.teacher_id,
    u.full_name AS teacher_name,
    u.email AS teacher_email,
    ca.teacher_type,
    ca.semester,
    ca.academic_year,
    ca.assigned_date,
    ca.assigned_by,
    ab.full_name AS assigned_by_name,
    ca.is_active,
    ca.end_date,
    ca.notes,
    ca.created_at,
    ca.updated_at
  FROM dbo.class_advisors ca
    INNER JOIN dbo.classes c ON ca.class_id = c.id
    INNER JOIN dbo.[users] u ON ca.teacher_id = u.id
    LEFT JOIN dbo.[users] ab ON ca.assigned_by = ab.id
  WHERE ca.id = SCOPE_IDENTITY();
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- ============================
-- SP: Get Class Advisors (with filters)
-- ============================
IF OBJECT_ID('dbo.sp_GetClassAdvisors', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetClassAdvisors;
GO

CREATE PROCEDURE dbo.sp_GetClassAdvisors
  @class_id INT = NULL,
  @teacher_id NVARCHAR(50) = NULL,
  @semester NVARCHAR(20) = NULL,
  @academic_year NVARCHAR(20) = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        SELECT
    ca.id,
    ca.class_id,
    c.name AS class_name,
    c.code AS class_code,
    c.major_id,
    m.name AS major_name,
    ca.teacher_id,
    u.full_name AS teacher_name,
    u.email AS teacher_email,
    u.phone AS teacher_phone,
    ca.teacher_type,
    ca.semester,
    ca.academic_year,
    ca.assigned_date,
    ca.assigned_by,
    ab.full_name AS assigned_by_name,
    ca.is_active,
    ca.end_date,
    ca.notes,
    ca.created_at,
    ca.updated_at,
    -- Count students in class
    (SELECT COUNT(*)
    FROM dbo.students s
    WHERE s.class_id = ca.class_id) AS student_count,
    -- Count profile entries
    (SELECT COUNT(*)
    FROM dbo.advisor_profiles ap
    WHERE ap.advisor_id = ca.id) AS profile_count
  FROM dbo.class_advisors ca
    INNER JOIN dbo.classes c ON ca.class_id = c.id
    LEFT JOIN dbo.majors m ON c.major_id = m.id
    INNER JOIN dbo.[users] u ON ca.teacher_id = u.id
    LEFT JOIN dbo.[users] ab ON ca.assigned_by = ab.id
  WHERE 
            (@class_id IS NULL OR ca.class_id = @class_id)
    AND (@teacher_id IS NULL OR ca.teacher_id = @teacher_id)
    AND (@semester IS NULL OR ca.semester = @semester)
    AND (@academic_year IS NULL OR ca.academic_year = @academic_year)
    AND (@is_active IS NULL OR ca.is_active = @is_active)
  ORDER BY ca.academic_year DESC, ca.semester DESC, ca.assigned_date DESC;
        
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
-- SP: Get Advisor Assignment History for Class
-- ============================
IF OBJECT_ID('dbo.sp_GetClassAdvisorHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetClassAdvisorHistory;
GO

CREATE PROCEDURE dbo.sp_GetClassAdvisorHistory
  @class_id INT
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        SELECT
    ca.id,
    ca.class_id,
    c.name AS class_name,
    c.code AS class_code,
    ca.teacher_id,
    u.full_name AS teacher_name,
    u.email AS teacher_email,
    ca.teacher_type,
    ca.semester,
    ca.academic_year,
    ca.assigned_date,
    ca.is_active,
    ca.end_date,
    ca.notes,
    DATEDIFF(DAY, ca.assigned_date, ISNULL(ca.end_date, GETDATE())) AS days_served,
    ca.created_at
  FROM dbo.class_advisors ca
    INNER JOIN dbo.classes c ON ca.class_id = c.id
    INNER JOIN dbo.[users] u ON ca.teacher_id = u.id
  WHERE ca.class_id = @class_id
  ORDER BY ca.academic_year DESC, ca.semester DESC, ca.assigned_date DESC;
        
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
-- SP: Update Class Advisor
-- ============================
IF OBJECT_ID('dbo.sp_UpdateClassAdvisor', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpdateClassAdvisor;
GO

CREATE PROCEDURE dbo.sp_UpdateClassAdvisor
  @id INT,
  @notes NVARCHAR(MAX) = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        -- Check if advisor exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.class_advisors
  WHERE id = @id)
        BEGIN
    RAISERROR('Class advisor with ID %d does not exist', 16, 1, @id);
    RETURN;
  END
        
        UPDATE dbo.class_advisors
        SET 
            notes = ISNULL(@notes, notes),
            is_active = ISNULL(@is_active, is_active),
            end_date = CASE 
                WHEN @is_active = 0 AND is_active = 1 THEN SYSUTCDATETIME()
                ELSE end_date
            END,
            updated_at = SYSUTCDATETIME()
        WHERE id = @id;
        
        -- Return updated record
        EXEC dbo.sp_GetClassAdvisors @class_id = NULL, @teacher_id = NULL, 
                                     @semester = NULL, @academic_year = NULL, @is_active = NULL;
        
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
-- SP: Delete Class Advisor Assignment
-- ============================
IF OBJECT_ID('dbo.sp_DeleteClassAdvisor', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DeleteClassAdvisor;
GO

CREATE PROCEDURE dbo.sp_DeleteClassAdvisor
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if advisor exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.class_advisors
  WHERE id = @id)
        BEGIN
    RAISERROR('Class advisor with ID %d does not exist', 16, 1, @id);
    RETURN;
  END
        
        -- Delete related profiles first (CASCADE should handle this, but explicit is safer)
        DELETE FROM dbo.advisor_profiles WHERE advisor_id = @id;
        
        -- Delete advisor assignment
        DELETE FROM dbo.class_advisors WHERE id = @id;
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- ============================
-- SP: Add Advisor Profile Entry
-- ============================
IF OBJECT_ID('dbo.sp_AddAdvisorProfile', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AddAdvisorProfile;
GO

CREATE PROCEDURE dbo.sp_AddAdvisorProfile
  @advisor_id INT,
  @profile_type NVARCHAR(50) = 'general',
  @title NVARCHAR(255) = NULL,
  @content NVARCHAR(MAX) = NULL,
  @profile_data NVARCHAR(MAX) = NULL,
  @attachments NVARCHAR(MAX) = NULL,
  @created_by NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        -- Validate advisor exists
        IF NOT EXISTS (SELECT 1
  FROM dbo.class_advisors
  WHERE id = @advisor_id)
        BEGIN
    RAISERROR('Class advisor with ID %d does not exist', 16, 1, @advisor_id);
    RETURN;
  END
        
        -- Insert profile entry
        INSERT INTO dbo.advisor_profiles
    (advisor_id, profile_type, title, content, profile_data, attachments, created_by)
  VALUES
    (@advisor_id, @profile_type, @title, @content, @profile_data, @attachments, @created_by);
        
        -- Return the new profile
        SELECT
    ap.id,
    ap.advisor_id,
    ap.profile_type,
    ap.title,
    ap.content,
    ap.profile_data,
    ap.attachments,
    ap.created_by,
    u.full_name AS created_by_name,
    ap.created_at,
    ap.updated_at
  FROM dbo.advisor_profiles ap
    LEFT JOIN dbo.[users] u ON ap.created_by = u.id
  WHERE ap.id = SCOPE_IDENTITY();
        
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
-- SP: Get Advisor Profiles
-- ============================
IF OBJECT_ID('dbo.sp_GetAdvisorProfiles', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetAdvisorProfiles;
GO

CREATE PROCEDURE dbo.sp_GetAdvisorProfiles
  @advisor_id INT = NULL,
  @class_id INT = NULL,
  @profile_type NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
        SELECT
    ap.id,
    ap.advisor_id,
    ca.class_id,
    c.name AS class_name,
    c.code AS class_code,
    ca.semester,
    ca.academic_year,
    ca.teacher_id,
    u_teacher.full_name AS teacher_name,
    ap.profile_type,
    ap.title,
    ap.content,
    ap.profile_data,
    ap.attachments,
    ap.created_by,
    u_creator.full_name AS created_by_name,
    ap.created_at,
    ap.updated_at
  FROM dbo.advisor_profiles ap
    INNER JOIN dbo.class_advisors ca ON ap.advisor_id = ca.id
    INNER JOIN dbo.classes c ON ca.class_id = c.id
    INNER JOIN dbo.[users] u_teacher ON ca.teacher_id = u_teacher.id
    LEFT JOIN dbo.[users] u_creator ON ap.created_by = u_creator.id
  WHERE 
            (@advisor_id IS NULL OR ap.advisor_id = @advisor_id)
    AND (@class_id IS NULL OR ca.class_id = @class_id)
    AND (@profile_type IS NULL OR ap.profile_type = @profile_type)
  ORDER BY ap.created_at DESC;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

PRINT 'Class advisors stored procedures created successfully';
GO
