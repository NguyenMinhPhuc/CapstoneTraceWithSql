USE [CapstoneTrack]
GO

-- Migration: Change internship_positions primary key from composite (defense_session_id, company_id)
-- to auto-increment id column, allowing multiple positions per company per session

-- Check if table exists with old schema (composite PK)
IF EXISTS (
  SELECT 1
FROM sys.key_constraints
WHERE name = 'pk_internship_positions'
  AND parent_object_id = OBJECT_ID('dbo.internship_positions')
)
BEGIN
  -- Check if id column exists
  IF NOT EXISTS (
    SELECT 1
  FROM sys.columns
  WHERE object_id = OBJECT_ID('dbo.internship_positions')
    AND name = 'id'
  )
  BEGIN
    -- Drop existing primary key
    ALTER TABLE dbo.internship_positions
    DROP CONSTRAINT pk_internship_positions;

    -- Add id column as identity
    ALTER TABLE dbo.internship_positions
    ADD id INT IDENTITY(1,1) NOT NULL;

    -- Add new primary key on id
    ALTER TABLE dbo.internship_positions
    ADD CONSTRAINT pk_internship_positions PRIMARY KEY (id);

    -- Add index for session + company lookup
    IF NOT EXISTS (SELECT 1
    FROM sys.indexes
    WHERE name = 'ix_internship_positions_session_company' AND object_id = OBJECT_ID('dbo.internship_positions'))
    BEGIN
      CREATE INDEX ix_internship_positions_session_company ON dbo.internship_positions(defense_session_id, company_id);
    END

    PRINT 'Migration complete: internship_positions now uses id as primary key';
  END
  ELSE
  BEGIN
    PRINT 'Migration skipped: id column already exists';
  END
END
ELSE
BEGIN
  PRINT 'Migration skipped: table does not exist or pk constraint not found';
END
GO
