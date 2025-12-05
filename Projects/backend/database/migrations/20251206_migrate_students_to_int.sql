-- Migration: Convert students.id from NVARCHAR(50) -> INT and update FK columns
-- Created: 2025-12-06
-- IMPORTANT: Run on a tested staging copy first. Take full backup before applying.
SET NOCOUNT ON;

BEGIN TRAN;
PRINT 'Starting migration: students.id -> INT';

-- 1) Create new students_int table with new INT identity PK and preserve old_id
IF OBJECT_ID('dbo.students_new', 'U') IS NOT NULL
BEGIN
  PRINT 'students_new already exists - abort';
  ROLLBACK TRAN;
  RETURN;
END

CREATE TABLE dbo.students_new (
  id INT IDENTITY(1,1) PRIMARY KEY,
  old_id NVARCHAR(50) NULL,
  user_id NVARCHAR(50) NOT NULL UNIQUE,
  student_code NVARCHAR(20) NOT NULL UNIQUE,
  class_id INT NULL,
  major_id INT NULL,
  gpa DECIMAL(3,2) NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'active',
  internship_type NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.student_id_map (
  old_id NVARCHAR(50) PRIMARY KEY,
  new_id INT NOT NULL
);

-- 2) Copy students into students_new and capture mapping
INSERT INTO dbo.students_new (old_id, user_id, student_code, class_id, major_id, gpa, status, internship_type, created_at, updated_at)
OUTPUT inserted.id, inserted.old_id INTO dbo.student_id_map(new_id, old_id)
SELECT id AS old_id, user_id, student_code, class_id, major_id, gpa, status, internship_type, created_at, updated_at
FROM dbo.students;

PRINT 'Students copied into students_new. Mapping table populated.';

-- 3) For each referencing table, add an INT column, backfill using mapping, add FK to students_new
-- Tables to migrate: topics, internship_registrations, progress_reports, defense_assignments, grades, student_profiles

-- Helper: topics
IF COL_LENGTH('dbo.topics','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.topics ADD student_id_int INT NULL;
  UPDATE t SET student_id_int = m.new_id FROM dbo.topics t JOIN dbo.student_id_map m ON t.student_id = m.old_id;
  ALTER TABLE dbo.topics ADD CONSTRAINT fk_topics_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE NO ACTION;
  PRINT 'topics backfilled';
END

-- internship_registrations
IF COL_LENGTH('dbo.internship_registrations','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.internship_registrations ADD student_id_int INT NULL;
  UPDATE r SET student_id_int = m.new_id FROM dbo.internship_registrations r JOIN dbo.student_id_map m ON r.student_id = m.old_id;
  ALTER TABLE dbo.internship_registrations ADD CONSTRAINT fk_internship_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE NO ACTION;
  PRINT 'internship_registrations backfilled';
END

-- progress_reports
IF COL_LENGTH('dbo.progress_reports','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.progress_reports ADD student_id_int INT NULL;
  UPDATE p SET student_id_int = m.new_id FROM dbo.progress_reports p JOIN dbo.student_id_map m ON p.student_id = m.old_id;
  ALTER TABLE dbo.progress_reports ADD CONSTRAINT fk_progress_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE NO ACTION;
  PRINT 'progress_reports backfilled';
END

-- defense_assignments
IF COL_LENGTH('dbo.defense_assignments','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.defense_assignments ADD student_id_int INT NULL;
  UPDATE d SET student_id_int = m.new_id FROM dbo.defense_assignments d JOIN dbo.student_id_map m ON d.student_id = m.old_id;
  ALTER TABLE dbo.defense_assignments ADD CONSTRAINT fk_defense_assignments_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE NO ACTION;
  PRINT 'defense_assignments backfilled';
END

-- grades
IF COL_LENGTH('dbo.grades','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.grades ADD student_id_int INT NULL;
  UPDATE g SET student_id_int = m.new_id FROM dbo.grades g JOIN dbo.student_id_map m ON g.student_id = m.old_id;
  ALTER TABLE dbo.grades ADD CONSTRAINT fk_grades_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE NO ACTION;
  PRINT 'grades backfilled';
END

-- student_profiles (if exists)
IF OBJECT_ID('dbo.student_profiles','U') IS NOT NULL AND COL_LENGTH('dbo.student_profiles','student_id_int') IS NULL
BEGIN
  ALTER TABLE dbo.student_profiles ADD student_id_int INT NULL;
  UPDATE s SET student_id_int = m.new_id FROM dbo.student_profiles s JOIN dbo.student_id_map m ON s.student_id = m.old_id;
  ALTER TABLE dbo.student_profiles ADD CONSTRAINT fk_student_profiles_student_int FOREIGN KEY (student_id_int) REFERENCES dbo.students_new(id) ON DELETE CASCADE;
  PRINT 'student_profiles backfilled';
END

PRINT 'Backfill complete for all referenced tables.';

-- 4) After verification, swap columns: drop old FK constraints and old student_id columns, rename *_int -> student_id, and recreate FKs to new students table.
-- NOTE: This next block is potentially destructive; it's commented out by default. Uncomment and run only AFTER manual verification of backfilled data.

/*
-- Example swap for topics (manual step)
ALTER TABLE dbo.topics DROP CONSTRAINT fk_topics_student;
ALTER TABLE dbo.topics DROP COLUMN student_id;
EXEC sp_rename 'dbo.topics.student_id_int', 'student_id', 'COLUMN';
ALTER TABLE dbo.topics ADD CONSTRAINT fk_topics_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION;

-- Repeat swap for other tables...
*/

PRINT 'Migration script created all mapping and backfill steps. Review data before running swap block.';
COMMIT TRAN;

GO
