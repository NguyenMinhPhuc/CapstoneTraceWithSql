-- Migration: Remove JSON CHECK constraint on supervisors.specializations
-- This allows storing plain NVARCHAR text in the specializations column

SET NOCOUNT ON;

BEGIN TRANSACTION;

IF EXISTS (
  SELECT 1
FROM sys.check_constraints cc
  JOIN sys.objects o ON cc.parent_object_id = o.object_id
WHERE cc.name = 'chk_supervisors_specializations_json' AND o.name = 'supervisors'
)
BEGIN
  ALTER TABLE dbo.supervisors DROP CONSTRAINT chk_supervisors_specializations_json;
END

COMMIT TRANSACTION;

GO
