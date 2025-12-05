-- ============================
-- Migration: Add Class Advisors Management System
-- Purpose: Track homeroom teachers/academic advisors by semester with profile management
-- Date: 2025-12-05
-- ============================

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

-- ============================
-- Table 1: class_advisors
-- Tracks homeroom teacher assignments by semester
-- ============================
IF OBJECT_ID('dbo.class_advisors', 'U') IS NULL
BEGIN
  PRINT 'Creating table: class_advisors';

  CREATE TABLE dbo.class_advisors
  (
    id INT IDENTITY(1,1) PRIMARY KEY,
    class_id INT NOT NULL,
    teacher_id NVARCHAR(50) NOT NULL,
    -- Can be user_id or supervisor_id
    teacher_type NVARCHAR(20) NOT NULL DEFAULT 'supervisor',
    -- 'supervisor' or 'user'
    semester NVARCHAR(20) NOT NULL,
    -- 'HK1', 'HK2', 'HK3' (hè)
    academic_year NVARCHAR(20) NOT NULL,
    -- '2024-2025'
    assigned_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    assigned_by NVARCHAR(50) NULL,
    -- admin/manager who assigned
    is_active BIT NOT NULL DEFAULT 1,
    -- Current active assignment
    end_date DATETIME2 NULL,
    -- When assignment ended
    notes NVARCHAR(MAX) NULL,
    -- Assignment notes
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_class_advisors_class FOREIGN KEY (class_id) 
            REFERENCES dbo.classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_advisors_user FOREIGN KEY (teacher_id) 
            REFERENCES dbo.[users](id) ON DELETE NO ACTION,
    CONSTRAINT fk_class_advisors_assigned_by FOREIGN KEY (assigned_by) 
            REFERENCES dbo.[users](id) ON DELETE NO ACTION,
    -- Ensure only one active advisor per class per semester/year
    CONSTRAINT uq_class_advisors_active UNIQUE (class_id, semester, academic_year, is_active)
  );

  PRINT 'Table class_advisors created successfully';
END
ELSE
BEGIN
  PRINT 'Table class_advisors already exists';
END
GO

-- ============================
-- Table 2: advisor_profiles
-- Stores advisor profile data (can be JSON for flexibility)
-- ============================
IF OBJECT_ID('dbo.advisor_profiles', 'U') IS NULL
BEGIN
  PRINT 'Creating table: advisor_profiles';

  CREATE TABLE dbo.advisor_profiles
  (
    id INT IDENTITY(1,1) PRIMARY KEY,
    advisor_id INT NOT NULL,
    -- FK to class_advisors
    profile_type NVARCHAR(50) NOT NULL DEFAULT 'general',
    -- 'general', 'student_list', 'activities', 'assessments'
    title NVARCHAR(255) NULL,
    -- Profile section title
    content NVARCHAR(MAX) NULL,
    -- Main content
    profile_data NVARCHAR(MAX) NULL,
    -- JSON data for structured information
    attachments NVARCHAR(MAX) NULL,
    -- JSON array of file URLs
    created_by NVARCHAR(50) NULL,
    -- Who created this profile entry
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_advisor_profiles_advisor FOREIGN KEY (advisor_id) 
            REFERENCES dbo.class_advisors(id) ON DELETE CASCADE,
    CONSTRAINT fk_advisor_profiles_created_by FOREIGN KEY (created_by) 
            REFERENCES dbo.[users](id) ON DELETE NO ACTION,
    -- Validate JSON if SQL Server 2016+
    CONSTRAINT chk_advisor_profiles_data CHECK (profile_data IS NULL OR ISJSON(profile_data) = 1),
    CONSTRAINT chk_advisor_profiles_attachments CHECK (attachments IS NULL OR ISJSON(attachments) = 1)
  );

  PRINT 'Table advisor_profiles created successfully';
END
ELSE
BEGIN
  PRINT 'Table advisor_profiles already exists';
END
GO

-- ============================
-- Indexes for Performance
-- ============================

-- class_advisors indexes
IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_class_advisors_class' AND object_id = OBJECT_ID('dbo.class_advisors'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_class_advisors_class 
        ON dbo.class_advisors(class_id, academic_year, semester);
  PRINT 'Index ix_class_advisors_class created';
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_class_advisors_teacher' AND object_id = OBJECT_ID('dbo.class_advisors'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_class_advisors_teacher 
        ON dbo.class_advisors(teacher_id, academic_year, semester);
  PRINT 'Index ix_class_advisors_teacher created';
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_class_advisors_active' AND object_id = OBJECT_ID('dbo.class_advisors'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_class_advisors_active 
        ON dbo.class_advisors(is_active, academic_year, semester) 
        WHERE is_active = 1;
  PRINT 'Index ix_class_advisors_active created';
END
GO

-- advisor_profiles indexes
IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_advisor_profiles_advisor' AND object_id = OBJECT_ID('dbo.advisor_profiles'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_advisor_profiles_advisor 
        ON dbo.advisor_profiles(advisor_id, profile_type);
  PRINT 'Index ix_advisor_profiles_advisor created';
END
GO

IF NOT EXISTS (SELECT 1
FROM sys.indexes
WHERE name = 'ix_advisor_profiles_created' AND object_id = OBJECT_ID('dbo.advisor_profiles'))
BEGIN
  CREATE NONCLUSTERED INDEX ix_advisor_profiles_created 
        ON dbo.advisor_profiles(created_at DESC);
  PRINT 'Index ix_advisor_profiles_created created';
END
GO

-- ============================
-- Trigger for updated_at
-- ============================
IF OBJECT_ID('dbo.trg_class_advisors_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_class_advisors_updated_at;
GO

CREATE TRIGGER dbo.trg_class_advisors_updated_at
ON dbo.class_advisors
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.class_advisors
    SET updated_at = SYSUTCDATETIME()
    FROM dbo.class_advisors ca
    INNER JOIN inserted i ON ca.id = i.id;
END
GO

IF OBJECT_ID('dbo.trg_advisor_profiles_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_advisor_profiles_updated_at;
GO

CREATE TRIGGER dbo.trg_advisor_profiles_updated_at
ON dbo.advisor_profiles
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.advisor_profiles
    SET updated_at = SYSUTCDATETIME()
    FROM dbo.advisor_profiles ap
    INNER JOIN inserted i ON ap.id = i.id;
END
GO

PRINT 'Migration completed: class_advisors and advisor_profiles tables ready';
GO
