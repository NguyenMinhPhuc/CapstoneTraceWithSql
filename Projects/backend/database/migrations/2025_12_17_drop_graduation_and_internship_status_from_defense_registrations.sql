USE [CapstoneTrack]
GO

-- Drop legacy graduation_status and internship_status columns from defense_registrations
IF COL_LENGTH('dbo.defense_registrations', 'graduation_status') IS NOT NULL
BEGIN
  ALTER TABLE dbo.defense_registrations
    DROP COLUMN graduation_status;
END
GO

IF COL_LENGTH('dbo.defense_registrations', 'internship_status') IS NOT NULL
BEGIN
  ALTER TABLE dbo.defense_registrations
    DROP COLUMN internship_status;
END
GO

-- Note: We keep `report_status` and `report_status_note`. Run this on staging first.
GO
