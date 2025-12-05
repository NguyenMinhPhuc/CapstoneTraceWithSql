-- Migration: Add student_profiles table
-- Created: 2025-12-05
SET NOCOUNT ON;

IF OBJECT_ID('dbo.student_profiles','U') IS NOT NULL
BEGIN
  PRINT 'student_profiles already exists';
  RETURN;
END

CREATE TABLE dbo.student_profiles
(

  student_id INT NOT NULL primary key,
  contact_info NVARCHAR(MAX) NULL,
  -- JSON: { address, phone, email }
  guardian_info NVARCHAR(MAX) NULL,
  -- JSON: { name, relation, phone, address }
  residence_address NVARCHAR(500) NULL,
  residency_type NVARCHAR(50) NULL,
  residency_details NVARCHAR(MAX) NULL,
  family_circumstances NVARCHAR(MAX) NULL,
  awards NVARCHAR(MAX) NULL,
  disciplinary NVARCHAR(MAX) NULL,
  activities NVARCHAR(MAX) NULL,
  health_status NVARCHAR(255) NULL,
  academic_advisor_id NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_student_profiles_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_profiles_advisor FOREIGN KEY (academic_advisor_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT chk_contact_info_json CHECK (contact_info IS NULL OR ISJSON(contact_info) = 1),
  CONSTRAINT chk_guardian_info_json CHECK (guardian_info IS NULL OR ISJSON(guardian_info) = 1)
);
GO

CREATE NONCLUSTERED INDEX ix_student_profiles_student ON dbo.student_profiles(student_id);
CREATE NONCLUSTERED INDEX ix_student_profiles_advisor ON dbo.student_profiles(academic_advisor_id);
GO
