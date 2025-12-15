IF OBJECT_ID('sp_UpdateDefenseSession','P') IS NOT NULL
  DROP PROCEDURE sp_UpdateDefenseSession;
GO

CREATE PROCEDURE sp_UpdateDefenseSession
  @id INT,
  @name NVARCHAR(255) = NULL,
  @session_type NVARCHAR(50) = NULL,
  @start_date DATE = NULL,
  @registration_deadline DATE = NULL,
  @submission_deadline DATE = NULL,
  @expected_date DATE = NULL,
  @description NVARCHAR(MAX) = NULL,
  @status NVARCHAR(50) = NULL,
  @linh_group NVARCHAR(255) = NULL,
  @council_score_ratio DECIMAL(5,2) = NULL,
  @supervisor_score_ratio DECIMAL(5,2) = NULL,
  @submission_folder_link NVARCHAR(500) = NULL,
  @submission_description NVARCHAR(MAX) = NULL,
  @council_rubric_id INT = NULL,
  @supervisor_rubric_id INT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.defense_sessions
  SET
    name = COALESCE(@name, name),
    session_type = COALESCE(@session_type, session_type),
    start_date = COALESCE(@start_date, start_date),
    registration_deadline = COALESCE(@registration_deadline, registration_deadline),
    submission_deadline = COALESCE(@submission_deadline, submission_deadline),
    expected_date = COALESCE(@expected_date, expected_date),
    description = COALESCE(@description, description),
    status = COALESCE(@status, status),
    linh_group = COALESCE(@linh_group, linh_group),
    council_score_ratio = COALESCE(@council_score_ratio, council_score_ratio),
    supervisor_score_ratio = COALESCE(@supervisor_score_ratio, supervisor_score_ratio),
    submission_folder_link = COALESCE(@submission_folder_link, submission_folder_link),
    submission_description = COALESCE(@submission_description, submission_description),
    council_rubric_id = COALESCE(@council_rubric_id, council_rubric_id),
    supervisor_rubric_id = COALESCE(@supervisor_rubric_id, supervisor_rubric_id),
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT *
  FROM dbo.defense_sessions
  WHERE id = @id;
END
GO
