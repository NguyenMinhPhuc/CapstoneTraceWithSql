-------------------------
-- 1. DROP TRIGGERS
-------------------------
IF OBJECT_ID('dbo.trg_topics_updated_at', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_topics_updated_at;
IF OBJECT_ID('dbo.trg_progress_reports_updated_at', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_progress_reports_updated_at;
IF OBJECT_ID('dbo.trg_internship_registrations_updated_at', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_internship_registrations_updated_at;
IF OBJECT_ID('dbo.trg_defense_assignments_updated_at', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_defense_assignments_updated_at;
IF OBJECT_ID('dbo.trg_grades_updated_at', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_grades_updated_at;
GO

-----------------------------------
-- 2. DROP FOREIGN KEYS TO AVOID ERRORS
-----------------------------------
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql = @sql + 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(parent_object_id)
	+ '].[' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];'
FROM sys.foreign_keys;

EXEC sp_executesql @sql;
GO

-------------------------
-- 3. DROP TABLES (SAFE ORDER)
-------------------------
DROP TABLE IF EXISTS dbo.grade_details;
DROP TABLE IF EXISTS dbo.grades;
DROP TABLE IF EXISTS dbo.defense_assignments;
DROP TABLE IF EXISTS dbo.progress_reports;
DROP TABLE IF EXISTS dbo.internship_registrations;
DROP TABLE IF EXISTS dbo.topics;

DROP TABLE IF EXISTS dbo.students;
DROP TABLE IF EXISTS dbo.supervisor_guidance_scope;
DROP TABLE IF EXISTS dbo.supervisors;
DROP TABLE IF EXISTS dbo.users;

DROP TABLE IF EXISTS dbo.classes;
DROP TABLE IF EXISTS dbo.companies;
DROP TABLE IF EXISTS dbo.majors;
DROP TABLE IF EXISTS dbo.refresh_tokens;
DROP TABLE IF EXISTS [dbo].[audit_logs]
DROP TABLE IF EXISTS [dbo].[conversation_participants]
DROP TABLE IF EXISTS [dbo].[conversations]
DROP TABLE IF EXISTS [dbo].[council_members]
DROP TABLE IF EXISTS [dbo].[councils]
DROP TABLE IF EXISTS [dbo].[defense_sessions]
DROP TABLE IF EXISTS [dbo].[messages]
DROP TABLE IF EXISTS [dbo].[notifications]
DROP TABLE IF EXISTS [dbo].[resource_links]
DROP TABLE IF EXISTS [dbo].[resources]
DROP TABLE IF EXISTS [dbo].[rubric_criteria]
DROP TABLE IF EXISTS [dbo].[rubrics]
DROP TABLE IF EXISTS [dbo].[subcommittee_members]
DROP TABLE IF EXISTS [dbo].[subcommittees]
DROP TABLE IF EXISTS [dbo].[system_settings]
GO
