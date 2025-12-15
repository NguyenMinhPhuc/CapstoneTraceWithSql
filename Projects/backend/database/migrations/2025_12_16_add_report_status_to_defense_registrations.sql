USE [CapstoneTrack]
GO

-- Add unified report_status and report_status_note to defense_registrations
IF COL_LENGTH('dbo.defense_registrations', 'report_status') IS NULL
BEGIN
  ALTER TABLE dbo.defense_registrations
    ADD report_status NVARCHAR(50) NULL,
        report_status_note NVARCHAR(MAX) NULL;

  -- Backfill: prefer graduation_status if present, otherwise internship_status
  UPDATE dbo.defense_registrations
  SET report_status = COALESCE(graduation_status, internship_status);

  -- Add index for quick filtering
  CREATE INDEX ix_defense_registrations_report_status ON dbo.defense_registrations(report_status);
END
GO
