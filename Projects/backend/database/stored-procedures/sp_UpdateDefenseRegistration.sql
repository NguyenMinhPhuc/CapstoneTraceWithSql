/*
  sp_UpdateDefenseRegistration
  Updates graduation/internship status and notes for a defense registration
*/
IF OBJECT_ID('sp_UpdateDefenseRegistration', 'P') IS NOT NULL
  DROP PROCEDURE sp_UpdateDefenseRegistration;
GO

CREATE PROCEDURE sp_UpdateDefenseRegistration
  @id INT,
  @graduation_status NVARCHAR(50) = NULL,
  @graduation_status_note NVARCHAR(MAX) = NULL,
  @internship_status NVARCHAR(50) = NULL,
  @internship_status_note NVARCHAR(MAX) = NULL,
  @report_status NVARCHAR(50) = NULL,
  @report_status_note NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Update only unified report_status/report_status_note and timestamp. Keep accepting legacy params for compatibility.
  UPDATE defense_registrations
  SET
    report_status = COALESCE(@report_status, @graduation_status, @internship_status, report_status),
    report_status_note = COALESCE(@report_status_note, @graduation_status_note, @internship_status_note, report_status_note),
    updated_at = GETDATE()
  WHERE id = @id;

  SELECT TOP 1
    *
  FROM defense_registrations
  WHERE id = @id;
END
GO
