-- Add lecturer_type column to supervisors table if it doesn't exist
IF COL_LENGTH('dbo.supervisors', 'lecturer_type') IS NULL
BEGIN
  ALTER TABLE dbo.supervisors
  ADD lecturer_type NVARCHAR(100) NULL;
END
GO
