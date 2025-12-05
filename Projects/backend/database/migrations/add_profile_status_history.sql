-- ============================
-- Migration: Add Profile Status History Table
-- Purpose: Track all changes to student profile status
-- Date: 2025-12-05
-- ============================

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

-- Create profile_status_history table
IF OBJECT_ID('dbo.profile_status_history', 'U') IS NULL
BEGIN
  PRINT 'Creating table: profile_status_history';

  CREATE TABLE dbo.profile_status_history
  (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    old_status NVARCHAR(50) NULL,
    new_status NVARCHAR(50) NOT NULL,
    changed_by NVARCHAR(50) NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    notes NVARCHAR(MAX) NULL,
    change_type NVARCHAR(50) NULL,
    -- 'status_change', 'data_entry', 'correction', etc.
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_profile_history_student FOREIGN KEY (student_id) 
            REFERENCES dbo.students(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_history_user FOREIGN KEY (changed_by) 
            REFERENCES dbo.[users](id) ON DELETE NO ACTION
  );

  PRINT 'Table profile_status_history created successfully';
END
ELSE
BEGIN
  PRINT 'Table profile_status_history already exists';
END
GO

-- Create indexes for performance
IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_profile_history_student' AND object_id = OBJECT_ID('dbo.profile_status_history'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_profile_history_student 
        ON dbo.profile_status_history(student_id, changed_at DESC);
  PRINT 'Index ix_profile_history_student created';
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_profile_history_changed_by' AND object_id = OBJECT_ID('dbo.profile_status_history'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_profile_history_changed_by 
        ON dbo.profile_status_history(changed_by);
  PRINT 'Index ix_profile_history_changed_by created';
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_profile_history_changed_at' AND object_id = OBJECT_ID('dbo.profile_status_history'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_profile_history_changed_at 
        ON dbo.profile_status_history(changed_at DESC);
  PRINT 'Index ix_profile_history_changed_at created';
END
GO

PRINT 'Migration completed: profile_status_history table and indexes ready';
GO
