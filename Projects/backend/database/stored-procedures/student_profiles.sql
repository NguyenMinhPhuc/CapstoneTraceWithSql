-- Stored procedures for student_profiles
SET NOCOUNT ON;

IF OBJECT_ID('dbo.sp_GetStudentProfileByStudentId','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_GetStudentProfileByStudentId;
GO
CREATE PROCEDURE dbo.sp_GetStudentProfileByStudentId
  @student_id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT *
  FROM student_profiles
  WHERE student_id = @student_id;
END;
GO

IF OBJECT_ID('dbo.sp_CreateStudentProfile','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_CreateStudentProfile;
GO
CREATE PROCEDURE dbo.sp_CreateStudentProfile
  @student_id INT,
  @contact_info NVARCHAR(MAX) = NULL,
  @guardian_info NVARCHAR(MAX) = NULL,
  @residency_type NVARCHAR(50) = NULL,
  @residency_details NVARCHAR(MAX) = NULL,
  @residence_address NVARCHAR(500) = NULL,
  @family_circumstances NVARCHAR(MAX) = NULL,
  @awards NVARCHAR(MAX) = NULL,
  @disciplinary NVARCHAR(MAX) = NULL,
  @activities NVARCHAR(MAX) = NULL,
  @health_status NVARCHAR(255) = NULL,
  @academic_advisor_id NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO student_profiles
    (student_id, contact_info, guardian_info, residency_type, residency_details, residence_address, family_circumstances, awards, disciplinary, activities, health_status, academic_advisor_id, created_at, updated_at)
  VALUES
    (@student_id, @contact_info, @guardian_info, @residency_type, @residency_details, @residence_address, @family_circumstances, @awards, @disciplinary, @activities, @health_status, @academic_advisor_id, GETDATE(), GETDATE());

  -- Return the inserted/created profile by student_id (table uses student_id as primary key)
  SELECT *
  FROM student_profiles
  WHERE student_id = @student_id;
END;
GO

IF OBJECT_ID('dbo.sp_UpdateStudentProfile','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_UpdateStudentProfile;
GO
CREATE PROCEDURE dbo.sp_UpdateStudentProfile
  @student_id INT,
  @contact_info NVARCHAR(MAX) = NULL,
  @guardian_info NVARCHAR(MAX) = NULL,
  @residency_type NVARCHAR(50) = NULL,
  @residency_details NVARCHAR(MAX) = NULL,
  @residence_address NVARCHAR(500) = NULL,
  @family_circumstances NVARCHAR(MAX) = NULL,
  @awards NVARCHAR(MAX) = NULL,
  @disciplinary NVARCHAR(MAX) = NULL,
  @activities NVARCHAR(MAX) = NULL,
  @health_status NVARCHAR(255) = NULL,
  @academic_advisor_id NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1
  FROM student_profiles
  WHERE student_id = @student_id)
  BEGIN
  THROW 50020, 'Student profile not found', 1;
END

UPDATE student_profiles
  SET contact_info = ISNULL(@contact_info, contact_info),
      guardian_info = ISNULL(@guardian_info, guardian_info),
      residency_type = ISNULL(@residency_type, residency_type),
      residency_details = ISNULL(@residency_details, residency_details),
      residence_address = ISNULL(@residence_address, residence_address),
      family_circumstances = ISNULL(@family_circumstances, family_circumstances),
      awards = ISNULL(@awards, awards),
      disciplinary = ISNULL(@disciplinary, disciplinary),
      activities = ISNULL(@activities, activities),
      health_status = ISNULL(@health_status, health_status),
      academic_advisor_id = ISNULL(@academic_advisor_id, academic_advisor_id),
      updated_at = GETDATE()
  WHERE student_id = @student_id;

SELECT *
FROM student_profiles
WHERE student_id = @student_id;
END;
GO

IF OBJECT_ID('dbo.sp_DeleteStudentProfile','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_DeleteStudentProfile;
GO
CREATE PROCEDURE dbo.sp_DeleteStudentProfile
  @student_id INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1
  FROM student_profiles
  WHERE student_id = @student_id)
  BEGIN
  THROW 50021, 'Student profile not found', 1;
END
DELETE FROM student_profiles WHERE student_id = @student_id;
END;
GO
