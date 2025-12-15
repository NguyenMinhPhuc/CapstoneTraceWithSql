-- sp_GetDefenseRegistrationsBySession.sql
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.sp_GetDefenseRegistrationsBySession', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetDefenseRegistrationsBySession;
GO

CREATE PROCEDURE dbo.sp_GetDefenseRegistrationsBySession
  @session_id INT
AS
BEGIN
  SET NOCOUNT ON;
  -- Return all registration columns (dr.*) so frontend can access
  -- project title, supervisors, counts and other fields. `report_status`
  -- is part of the table and will be included. Also join student/class info.
  SELECT
    dr.*,
    s.student_code AS student_code_from_students,
    s.user_id AS student_user_id,
    c.code AS class_code
  FROM dbo.defense_registrations dr
    LEFT JOIN dbo.students s ON s.id = dr.student_id
    LEFT JOIN dbo.classes c ON c.id = s.class_id
  WHERE dr.session_id = @session_id
  ORDER BY dr.created_at DESC;
END
GO
