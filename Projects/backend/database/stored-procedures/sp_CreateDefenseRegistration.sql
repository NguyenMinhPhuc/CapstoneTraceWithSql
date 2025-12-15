-- sp_CreateDefenseRegistration.sql
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.sp_CreateDefenseRegistration', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CreateDefenseRegistration;
GO

CREATE PROCEDURE dbo.sp_CreateDefenseRegistration
  @session_id INT,
  @student_id INT,
  @student_code NVARCHAR(50),
  @student_name NVARCHAR(255),
  @class_name NVARCHAR(100) = NULL,
  @graduation_status NVARCHAR(50) = NULL,
  @internship_status NVARCHAR(50) = NULL,
  @report_status NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Only store unified report_status in new schema. Legacy params are accepted for compatibility
  INSERT INTO dbo.defense_registrations
    (session_id, student_id, student_code, student_name, class_name, report_status, created_at, updated_at)
  VALUES
    (@session_id, @student_id, @student_code, @student_name, @class_name, COALESCE(@report_status, @graduation_status, @internship_status), SYSUTCDATETIME(), SYSUTCDATETIME());

  SELECT *
  FROM dbo.defense_registrations
  WHERE id = SCOPE_IDENTITY();
END
GO
