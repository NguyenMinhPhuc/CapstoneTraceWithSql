-- Migration: Convert supervisors.department from NVARCHAR to INT (store major.id)
-- Steps:
-- 1) Add temporary column department_new INT NULL
-- 2) Try to map existing values:
--    a) If department already stores numeric ids (as string), cast to int
--    b) Else try to map by majors.code
--    c) Else try to map by majors.name
-- 3) Replace old column with new INT column and copy values

SET NOCOUNT ON;

BEGIN TRANSACTION;
-- Add temporary column
IF COL_LENGTH('dbo.supervisors', 'department_new') IS NULL
  ALTER TABLE dbo.supervisors ADD department_new INT NULL;

-- 2a) Try cast to int
UPDATE dbo.supervisors
SET department_new = TRY_CAST(department AS INT)
WHERE department IS NOT NULL;

-- 2b) Map by majors.code where department_new IS NULL
UPDATE s
SET department_new = m.id
FROM dbo.supervisors s
  JOIN dbo.majors m ON s.department = m.code
WHERE s.department_new IS NULL AND s.department IS NOT NULL;

-- 2c) Map by majors.name where department_new IS NULL
UPDATE s
SET department_new = m.id
FROM dbo.supervisors s
  JOIN dbo.majors m ON s.department = m.name
WHERE s.department_new IS NULL AND s.department IS NOT NULL;

-- At this point department_new contains mapped major ids when possible.
-- Create final INT column if not exists
IF COL_LENGTH('dbo.supervisors', 'department_int') IS NULL
  ALTER TABLE dbo.supervisors ADD department_int INT NULL;

-- Copy values
UPDATE dbo.supervisors SET department_int = department_new;

-- Drop old department column and rename new
-- Note: DROP COLUMN may fail if there are dependencies; ensure backups before running
ALTER TABLE dbo.supervisors DROP COLUMN department;
EXEC sp_rename 'dbo.supervisors.department_int', 'department', 'COLUMN';

-- Remove temporary column if exists
IF COL_LENGTH('dbo.supervisors', 'department_new') IS NOT NULL
  ALTER TABLE dbo.supervisors DROP COLUMN department_new;

COMMIT TRANSACTION;

GO
