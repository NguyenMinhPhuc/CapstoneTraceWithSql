IF OBJECT_ID('sp_CreateDefenseSession','P') IS NOT NULL
  DROP PROCEDURE sp_CreateDefenseSession;
GO

CREATE PROCEDURE sp_CreateDefenseSession
  @name NVARCHAR(255),
  @session_type NVARCHAR(50),
  @start_date DATE = NULL,
  @registration_deadline DATE = NULL,
  @submission_deadline DATE = NULL,
  @expected_date DATE = NULL,
  @description NVARCHAR(MAX) = NULL,
  @status NVARCHAR(50) = 'scheduled',
  @linh_group NVARCHAR(50) = NULL,
  @council_score_ratio INT = NULL,
  @supervisor_score_ratio INT = NULL,
  @submission_folder_link NVARCHAR(500) = NULL,
  @submission_description NVARCHAR(MAX) = NULL,
  @council_rubric_id INT = NULL,
  @supervisor_rubric_id INT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.defense_sessions
    (name, session_type, start_date, registration_deadline, submission_deadline, expected_date, description, status,
    linh_group, council_score_ratio, supervisor_score_ratio, submission_folder_link, submission_description,
    council_rubric_id, supervisor_rubric_id)
  VALUES
    (@name, @session_type, @start_date, @registration_deadline, @submission_deadline, @expected_date, @description, @status,
      @linh_group, @council_score_ratio, @supervisor_score_ratio, @submission_folder_link, @submission_description,
      @council_rubric_id, @supervisor_rubric_id);

  SELECT *
  FROM dbo.defense_sessions
  WHERE id = SCOPE_IDENTITY();
END
GO
