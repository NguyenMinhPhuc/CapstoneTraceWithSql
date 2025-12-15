/***********************************************
 CapstoneTrack � SQL Server schema (safe version)
 - No inline INDEX in CREATE TABLE
 - JSON validation where applicable (ISJSON)
 - Safe FK rules to avoid multiple cascade paths
 - Safe triggers for updated_at
 - Uses SYSUTCDATETIME() for timestamps
 Requirements: SQL Server 2016+
************************************************/

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- Enable snapshot isolation (if desired)
ALTER DATABASE CURRENT SET ALLOW_SNAPSHOT_ISOLATION ON;
ALTER DATABASE CURRENT SET READ_COMMITTED_SNAPSHOT ON;
GO

-- ============================
-- CLEANUP (DROP tables if exist)
-- Run this block if you want to start from clean slate.
-- Be careful: this will remove data.
-- ============================
PRINT 'Dropping existing objects (if any) - be careful: this removes data.';

-- Drop triggers if exist to avoid dependency problems
IF OBJECT_ID('dbo.trg_users_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_users_updated_at;
IF OBJECT_ID('dbo.trg_students_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_students_updated_at;
IF OBJECT_ID('dbo.trg_topics_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_topics_updated_at;
IF OBJECT_ID('dbo.trg_progress_reports_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_progress_reports_updated_at;
IF OBJECT_ID('dbo.trg_internship_registrations_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_internship_registrations_updated_at;
IF OBJECT_ID('dbo.trg_defense_assignments_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_defense_assignments_updated_at;
IF OBJECT_ID('dbo.trg_companies_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_companies_updated_at;
IF OBJECT_ID('dbo.trg_resources_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_resources_updated_at;
IF OBJECT_ID('dbo.trg_grades_updated_at','TR') IS NOT NULL DROP TRIGGER dbo.trg_grades_updated_at;
GO

-- Drop tables in reverse dependency order (safe)
DROP TABLE IF EXISTS dbo.grade_details;
DROP TABLE IF EXISTS dbo.grades;
DROP TABLE IF EXISTS dbo.rubric_criteria;
DROP TABLE IF EXISTS dbo.rubrics;
DROP TABLE IF EXISTS dbo.defense_assignments;
DROP TABLE IF EXISTS dbo.subcommittee_members;
DROP TABLE IF EXISTS dbo.subcommittees;
DROP TABLE IF EXISTS dbo.council_members;
DROP TABLE IF EXISTS dbo.councils;
DROP TABLE IF EXISTS dbo.defense_sessions;
DROP TABLE IF EXISTS dbo.progress_reports;
DROP TABLE IF EXISTS dbo.internship_registrations;
DROP TABLE IF EXISTS dbo.topics;
DROP TABLE IF EXISTS dbo.supervisor_guidance_scope;
DROP TABLE IF EXISTS dbo.supervisors;
DROP TABLE IF EXISTS dbo.students;
DROP TABLE IF EXISTS dbo.classes;
DROP TABLE IF EXISTS dbo.majors;
DROP TABLE IF EXISTS dbo.refresh_tokens;
DROP TABLE IF EXISTS dbo.notifications;
DROP TABLE IF EXISTS dbo.messages;
DROP TABLE IF EXISTS dbo.conversation_participants;
DROP TABLE IF EXISTS dbo.conversations;
DROP TABLE IF EXISTS dbo.resource_links;
DROP TABLE IF EXISTS dbo.resources;
DROP TABLE IF EXISTS dbo.audit_logs;
DROP TABLE IF EXISTS dbo.system_settings;
DROP TABLE IF EXISTS dbo.companies;
DROP TABLE IF EXISTS dbo.users;
GO

-- =======================
-- CREATE: USERS
-- =======================
CREATE TABLE dbo.[users]
(
  id NVARCHAR(50) PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(500) NOT NULL,
  password_algo NVARCHAR(50) NOT NULL DEFAULT 'bcrypt',
  password_version INT NOT NULL DEFAULT 1,
  full_name NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'supervisor', 'student', 'council_member')),
  phone NVARCHAR(20) NULL,
  avatar_url NVARCHAR(500) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  last_login DATETIME2 NULL,
  rowversion_col rowversion
);
GO

CREATE NONCLUSTERED INDEX ix_users_email ON dbo.[users](email);
CREATE NONCLUSTERED INDEX ix_users_role  ON dbo.[users](role);
GO

-- =======================
-- CREATE: MAJORS
-- =======================
CREATE TABLE dbo.majors
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(20) NOT NULL UNIQUE,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- =======================
-- CREATE: COMPANIES
-- =======================
CREATE TABLE dbo.companies
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  address NVARCHAR(500) NULL,
  phone NVARCHAR(20) NULL,
  email NVARCHAR(255) NULL,
  contact_person NVARCHAR(255) NULL,
  contact_phone NVARCHAR(20) NULL,
  website NVARCHAR(255) NULL,
  description NVARCHAR(MAX) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion
);
GO
CREATE NONCLUSTERED INDEX ix_companies_name   ON dbo.companies(name);
CREATE NONCLUSTERED INDEX ix_companies_active ON dbo.companies(is_active);
GO

-- =======================
-- CREATE: CLASSES
-- =======================
CREATE TABLE dbo.classes
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL UNIQUE,
  name NVARCHAR(255) NOT NULL,
  major_id INT NULL,
  academic_year NVARCHAR(20) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (major_id) REFERENCES dbo.majors(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_classes_major ON dbo.classes(major_id);
CREATE NONCLUSTERED INDEX ix_classes_year ON dbo.classes(academic_year);
GO

-- =======================
-- CREATE: REFRESH_TOKENS (store token as hashed value if desired)
-- =======================
CREATE TABLE dbo.refresh_tokens
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id NVARCHAR(50) NOT NULL,
  token_hash NVARCHAR(500) NOT NULL UNIQUE,
  token_algo NVARCHAR(50) NOT NULL DEFAULT 'sha256',
  expires_at DATETIME2 NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  created_ip NVARCHAR(50) NULL,
  created_user_agent NVARCHAR(500) NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_refresh_tokens_user ON dbo.refresh_tokens(user_id);
GO

-- =======================
-- CREATE: STUDENTS
-- =======================
CREATE TABLE dbo.students
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id NVARCHAR(50) NOT NULL UNIQUE,
  student_code NVARCHAR(20) NOT NULL UNIQUE,
  class_id INT NULL,
  major_id INT NULL,
  gpa DECIMAL(3,2) NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'active',
  internship_type NVARCHAR(50) NULL CHECK (internship_type IN ('early','graduation') OR internship_type IS NULL),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES dbo.classes(id) ON DELETE NO ACTION,
  CONSTRAINT fk_students_major FOREIGN KEY (major_id) REFERENCES dbo.majors(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_students_user  ON dbo.students(user_id);
CREATE NONCLUSTERED INDEX ix_students_class ON dbo.students(class_id);
CREATE NONCLUSTERED INDEX ix_students_major ON dbo.students(major_id);
CREATE NONCLUSTERED INDEX ix_students_code  ON dbo.students(student_code);
GO

-- =======================
-- CREATE: SUPERVISORS
-- =======================
CREATE TABLE dbo.supervisors
(
  id NVARCHAR(50) PRIMARY KEY,
  user_id NVARCHAR(50) NOT NULL UNIQUE,
  department NVARCHAR(255) NULL,
  title NVARCHAR(100) NULL,
  max_students INT NOT NULL DEFAULT 10,
  current_students INT NOT NULL DEFAULT 0,
  specializations NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_supervisors_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  -- specializations stored as plain NVARCHAR text (no JSON constraint)
);
GO
CREATE NONCLUSTERED INDEX ix_supervisors_user ON dbo.supervisors(user_id);
GO

-- =======================
-- CREATE: supervisor_guidance_scope
-- =======================
CREATE TABLE dbo.supervisor_guidance_scope
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  supervisor_id NVARCHAR(50) NOT NULL,
  major_id INT NOT NULL,
  guidance_type NVARCHAR(50) NOT NULL CHECK (guidance_type IN ('early_internship','graduation_internship','graduation_thesis')),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_sgs_supervisor FOREIGN KEY (supervisor_id) REFERENCES dbo.supervisors(id) ON DELETE NO ACTION,
  CONSTRAINT fk_sgs_major FOREIGN KEY (major_id) REFERENCES dbo.majors(id) ON DELETE NO ACTION,
  CONSTRAINT ux_sgs_unique UNIQUE (supervisor_id, major_id, guidance_type)
);
GO

-- =======================
-- CREATE: TOPICS
-- (student_id/supervisor_id/company_id/major_id use SET NULL to avoid cascade chains)
-- =======================
CREATE TABLE dbo.topics
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(500) NOT NULL,
  description NVARCHAR(MAX) NULL,
  student_id INT NULL,
  supervisor_id NVARCHAR(50) NULL,
  company_id INT NULL,
  topic_type NVARCHAR(50) NULL CHECK (topic_type IN ('early_internship','graduation_internship','graduation_thesis') OR topic_type IS NULL),
  status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','in_progress','completed')),
  major_id INT NULL,
  submitted_at DATETIME2 NULL,
  approved_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_topics_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION,
  CONSTRAINT fk_topics_supervisor FOREIGN KEY (supervisor_id) REFERENCES dbo.supervisors(id) ON DELETE NO ACTION,
  CONSTRAINT fk_topics_company FOREIGN KEY (company_id) REFERENCES dbo.companies(id) ON DELETE NO ACTION,
  CONSTRAINT fk_topics_major FOREIGN KEY (major_id) REFERENCES dbo.majors(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_topics_student   ON dbo.topics(student_id);
CREATE NONCLUSTERED INDEX ix_topics_supervisor ON dbo.topics(supervisor_id);
CREATE NONCLUSTERED INDEX ix_topics_status    ON dbo.topics(status);
CREATE NONCLUSTERED INDEX ix_topics_type      ON dbo.topics(topic_type);
GO

-- =======================
-- CREATE: INTERNSHIP_REGISTRATIONS
-- =======================
CREATE TABLE dbo.internship_registrations
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL,
  topic_id INT NULL,
  company_id INT NULL,
  supervisor_id NVARCHAR(50) NULL,
  internship_type NVARCHAR(50) NOT NULL CHECK (internship_type IN ('early','graduation')),
  start_date DATE NULL,
  end_date DATE NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','in_progress','completed')),
  registration_data NVARCHAR(MAX) NULL,
  submitted_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  reviewed_at DATETIME2 NULL,
  reviewed_by NVARCHAR(50) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_internship_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION,
  CONSTRAINT fk_internship_topic FOREIGN KEY (topic_id) REFERENCES dbo.topics(id) ON DELETE NO ACTION,
  CONSTRAINT fk_internship_company FOREIGN KEY (company_id) REFERENCES dbo.companies(id) ON DELETE NO ACTION,
  CONSTRAINT fk_internship_supervisor FOREIGN KEY (supervisor_id) REFERENCES dbo.supervisors(id) ON DELETE NO ACTION,
  CONSTRAINT fk_internship_reviewedby FOREIGN KEY (reviewed_by) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT chk_internship_registration_data_json CHECK (registration_data IS NULL OR ISJSON(registration_data) = 1)
);
GO
CREATE NONCLUSTERED INDEX ix_internship_reg_student ON dbo.internship_registrations(student_id);
CREATE NONCLUSTERED INDEX ix_internship_reg_status  ON dbo.internship_registrations(status);
CREATE NONCLUSTERED INDEX ix_internship_reg_type    ON dbo.internship_registrations(internship_type);
GO

-- =======================
-- CREATE: PROGRESS_REPORTS
-- =======================
CREATE TABLE dbo.progress_reports
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL,
  topic_id INT NULL,
  report_type NVARCHAR(50) NOT NULL CHECK (report_type IN ('weekly','proposal','progress','final','post_defense')),
  week_number INT NULL,
  title NVARCHAR(500) NULL,
  content NVARCHAR(MAX) NULL,
  attachments NVARCHAR(MAX) NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','approved','rejected','revision_required')),
  submitted_at DATETIME2 NULL,
  reviewed_at DATETIME2 NULL,
  reviewed_by NVARCHAR(50) NULL,
  feedback NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION,
  CONSTRAINT fk_progress_topic FOREIGN KEY (topic_id) REFERENCES dbo.topics(id) ON DELETE NO ACTION,
  CONSTRAINT fk_progress_reviewedby FOREIGN KEY (reviewed_by) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT chk_progress_attachments_json CHECK (attachments IS NULL OR ISJSON(attachments) = 1)
);
GO
CREATE NONCLUSTERED INDEX ix_progress_reports_student ON dbo.progress_reports(student_id);
CREATE NONCLUSTERED INDEX ix_progress_reports_topic   ON dbo.progress_reports(topic_id);
CREATE NONCLUSTERED INDEX ix_progress_reports_type    ON dbo.progress_reports(report_type);
CREATE NONCLUSTERED INDEX ix_progress_reports_status  ON dbo.progress_reports(status);
GO

-- =======================
-- CREATE: DEFENSE SESSIONS & RELATED
-- =======================
USE [CapstoneTrack]
GO

/****** Object:  Table [dbo].[defense_sessions]    Script Date: 06/12/2025 08:39:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
USE [CapstoneTrack]
GO

/****** Object:  Table [dbo].[session_type]    Script Date: 09/12/2025 14:01:23 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[session_type]
(
  [id] [nvarchar](50) NOT NULL,
  [name] [nvarchar](250) NULL,
  [description] [nvarchar](250) NULL,
  [is_active] [bit] NOT NULL,
  [create_at] [date] NOT NULL,
  [update_at] [date] NULL,
  CONSTRAINT [PK_session_type] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[session_type] ADD  CONSTRAINT [DF_session_type_is_active]  DEFAULT ((1)) FOR [is_active]
GO

ALTER TABLE [dbo].[session_type] ADD  CONSTRAINT [DF_session_type_create_at]  DEFAULT (getdate()) FOR [create_at]
GO



go
CREATE TABLE [dbo].[defense_sessions]
(
  [id] [int] IDENTITY(1,1) NOT NULL,
  [name] [nvarchar](255) NOT NULL,
  [session_type] [nvarchar](50) NOT NULL,
  [start_date] [date] NULL,
  [registration_deadline] [date] NULL,
  [submission_deadline] [date] NULL,
  [expected_date] [date] NULL,
  [description] [nvarchar](max) NULL,
  [status] [nvarchar](50) NOT NULL,
  [created_at] [datetime2](7) NOT NULL,
  [updated_at] [datetime2](7) NOT NULL,
  [rowversion_col] [timestamp] NOT NULL,
  CONSTRAINT [PK__defense___3213E83FB2E5DEE9] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[defense_sessions] ADD  CONSTRAINT [DF__defense_s__statu__2077C861]  DEFAULT ('scheduled') FOR [status]
GO

ALTER TABLE [dbo].[defense_sessions] ADD  CONSTRAINT [DF__defense_s__creat__226010D3]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

ALTER TABLE [dbo].[defense_sessions] ADD  CONSTRAINT [DF__defense_s__updat__2354350C]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO
ALTER TABLE [dbo].[defense_sessions] 
ADD  CONSTRAINT  fk_defense_sesions_sessions_type foreign key (session_type) references dbo.session_type(id) ON DELETE NO ACTION
GO



ALTER TABLE [dbo].[defense_sessions] CHECK CONSTRAINT [CK__defense_s__sessi__1F83A428]
GO

ALTER TABLE [dbo].[defense_sessions]  WITH CHECK ADD  CONSTRAINT [CK__defense_s__statu__216BEC9A] CHECK  (([status]='cancelled' OR [status]='completed' OR [status]='in_progress' OR [status]='scheduled'))
GO

ALTER TABLE [dbo].[defense_sessions] CHECK CONSTRAINT [CK__defense_s__statu__216BEC9A]
GO

-- Add new columns for defense sessions
ALTER TABLE [dbo].[defense_sessions] ADD [linh_group] [nvarchar](50) NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [council_score_ratio] [int] NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [supervisor_score_ratio] [int] NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [submission_folder_link] [nvarchar](500) NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [submission_description] [nvarchar](max) NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [council_rubric_id] [int] NULL;
GO
ALTER TABLE [dbo].[defense_sessions] ADD [supervisor_rubric_id] [int] NULL;
GO

-- Add foreign keys for rubrics
ALTER TABLE [dbo].[defense_sessions] ADD CONSTRAINT [FK_defense_sessions_council_rubric] FOREIGN KEY ([council_rubric_id]) REFERENCES [dbo].[rubrics] ([id]);
GO
ALTER TABLE [dbo].[defense_sessions] ADD CONSTRAINT [FK_defense_sessions_supervisor_rubric] FOREIGN KEY ([supervisor_rubric_id]) REFERENCES [dbo].[rubrics] ([id]);
GO



GO

CREATE TABLE dbo.councils
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  defense_session_id INT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_councils_defense FOREIGN KEY (defense_session_id) REFERENCES dbo.defense_sessions(id) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.council_members
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  council_id INT NOT NULL,
  user_id NVARCHAR(50) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('president','secretary','member','reviewer')),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_council_members_council FOREIGN KEY (council_id) REFERENCES dbo.councils(id) ON DELETE NO ACTION,
  CONSTRAINT fk_council_members_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT ux_council_user UNIQUE (council_id,user_id)
);
GO

CREATE TABLE dbo.subcommittees
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  defense_session_id INT NOT NULL,
  name NVARCHAR(255) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_subcommittees_defense FOREIGN KEY (defense_session_id) REFERENCES dbo.defense_sessions(id) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.subcommittee_members
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  subcommittee_id INT NOT NULL,
  user_id NVARCHAR(50) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('president','secretary','member')),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_subcommittee_members_subcommittee FOREIGN KEY (subcommittee_id) REFERENCES dbo.subcommittees(id) ON DELETE NO ACTION,
  CONSTRAINT fk_subcommittee_members_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT ux_subcommittee_user UNIQUE (subcommittee_id,user_id)
);
GO

CREATE TABLE dbo.defense_assignments
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  defense_session_id INT NOT NULL,
  student_id INT NOT NULL,
  topic_id INT NULL,
  subcommittee_id INT NULL,
  defense_order INT NULL,
  defense_time TIME NULL,
  room NVARCHAR(100) NULL,
  status NVARCHAR(50) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','completed','absent','rescheduled')),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_defense_assignments_session FOREIGN KEY (defense_session_id) REFERENCES dbo.defense_sessions(id) ON DELETE NO ACTION,
  CONSTRAINT fk_defense_assignments_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION,
  CONSTRAINT fk_defense_assignments_topic FOREIGN KEY (topic_id) REFERENCES dbo.topics(id) ON DELETE NO ACTION,
  CONSTRAINT fk_defense_assignments_subcommittee FOREIGN KEY (subcommittee_id) REFERENCES dbo.subcommittees(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_defense_assignments_session ON dbo.defense_assignments(defense_session_id);
CREATE NONCLUSTERED INDEX ix_defense_assignments_student ON dbo.defense_assignments(student_id);
GO

-- =======================
-- CREATE: RUBRICS, CRITERIA, GRADES
-- =======================
CREATE TABLE dbo.rubrics
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  rubric_type NVARCHAR(50) NOT NULL CHECK (rubric_type IN ('supervisor','council','reviewer','early_internship')),
  description NVARCHAR(MAX) NULL,
  total_score DECIMAL(7,2) NOT NULL DEFAULT 100.00,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion
);
GO
CREATE NONCLUSTERED INDEX ix_rubrics_type ON dbo.rubrics(rubric_type);
CREATE NONCLUSTERED INDEX ix_rubrics_active ON dbo.rubrics(is_active);
GO

CREATE TABLE dbo.rubric_criteria
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  rubric_id INT NOT NULL,
  name NVARCHAR(500) NOT NULL,
  description NVARCHAR(MAX) NULL,
  max_score DECIMAL(7,2) NOT NULL,
  weight DECIMAL(7,2) NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_rubric_criteria_rubric FOREIGN KEY (rubric_id) REFERENCES dbo.rubrics(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_rubric_criteria_rubric ON dbo.rubric_criteria(rubric_id);
GO

CREATE TABLE dbo.grades
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  student_id INT NOT NULL,
  topic_id INT NULL,
  defense_assignment_id INT NULL,
  grader_id NVARCHAR(50) NOT NULL,
  rubric_id INT NOT NULL,
  grade_type NVARCHAR(50) NOT NULL CHECK (grade_type IN ('supervisor','council','reviewer','early_internship')),
  total_score DECIMAL(7,2) NULL,
  comments NVARCHAR(MAX) NULL,
  submitted_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION,
  CONSTRAINT fk_grades_topic FOREIGN KEY (topic_id) REFERENCES dbo.topics(id) ON DELETE NO ACTION,
  CONSTRAINT fk_grades_assignment FOREIGN KEY (defense_assignment_id) REFERENCES dbo.defense_assignments(id) ON DELETE NO ACTION,
  CONSTRAINT fk_grades_grader FOREIGN KEY (grader_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT fk_grades_rubric FOREIGN KEY (rubric_id) REFERENCES dbo.rubrics(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_grades_student ON dbo.grades(student_id);
CREATE NONCLUSTERED INDEX ix_grades_grader ON dbo.grades(grader_id);
CREATE NONCLUSTERED INDEX ix_grades_type ON dbo.grades(grade_type);
GO

CREATE TABLE dbo.grade_details
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  grade_id INT NOT NULL,
  criterion_id INT NOT NULL,
  score DECIMAL(7,2) NOT NULL,
  comments NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_grade_details_grade FOREIGN KEY (grade_id) REFERENCES dbo.grades(id) ON DELETE NO ACTION,
  CONSTRAINT fk_grade_details_criterion FOREIGN KEY (criterion_id) REFERENCES dbo.rubric_criteria(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_grade_details_grade ON dbo.grade_details(grade_id);
GO

-- =======================
-- CREATE: RESOURCES & LINKS
-- =======================
CREATE TABLE dbo.resources
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  summary NVARCHAR(MAX) NULL,
  category NVARCHAR(50) NOT NULL CHECK (category IN ('graduation','internship','form','template','guideline')),
  resource_type NVARCHAR(50) NULL CHECK (resource_type IN ('document','link','template') OR resource_type IS NULL),
  created_by NVARCHAR(50) NULL,
  is_active BIT NOT NULL DEFAULT 1,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_resources_created_by FOREIGN KEY (created_by) REFERENCES dbo.[users](id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_resources_category ON dbo.resources(category);
CREATE NONCLUSTERED INDEX ix_resources_active ON dbo.resources(is_active);
GO

CREATE TABLE dbo.resource_links
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  resource_id INT NOT NULL,
  label NVARCHAR(255) NOT NULL,
  url NVARCHAR(1000) NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_resource_links_resource FOREIGN KEY (resource_id) REFERENCES dbo.resources(id) ON DELETE NO ACTION
);
GO

-- =======================
-- CREATE: CONVERSATIONS / MESSAGES
-- =======================
CREATE TABLE dbo.conversations
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  subject NVARCHAR(500) NOT NULL,
  created_by NVARCHAR(50) NOT NULL,
  last_message_at DATETIME2 NULL,
  last_message_snippet NVARCHAR(500) NULL,
  is_closed BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_conversations_created_by FOREIGN KEY (created_by) REFERENCES dbo.[users](id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_conversations_created_by ON dbo.conversations(created_by);
CREATE NONCLUSTERED INDEX ix_conversations_last_message ON dbo.conversations(last_message_at);
GO

CREATE TABLE dbo.conversation_participants
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  conversation_id INT NOT NULL,
  user_id NVARCHAR(50) NOT NULL,
  has_read BIT NOT NULL DEFAULT 0,
  joined_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_conv_participants_conversation FOREIGN KEY (conversation_id) REFERENCES dbo.conversations(id) ON DELETE NO ACTION,
  CONSTRAINT fk_conv_participants_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT ux_conv_participant UNIQUE (conversation_id,user_id)
);
GO

CREATE TABLE dbo.messages
(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id NVARCHAR(50) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  attachments NVARCHAR(MAX) NULL,
  mentioned_users NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES dbo.conversations(id) ON DELETE NO ACTION,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT chk_messages_attachments_json CHECK (attachments IS NULL OR ISJSON(attachments) = 1),
  CONSTRAINT chk_messages_mentioned_json CHECK (mentioned_users IS NULL OR ISJSON(mentioned_users) = 1)
);
GO
CREATE NONCLUSTERED INDEX ix_messages_conversation ON dbo.messages(conversation_id);
CREATE NONCLUSTERED INDEX ix_messages_sender ON dbo.messages(sender_id);
CREATE NONCLUSTERED INDEX ix_messages_created ON dbo.messages(created_at);
GO

-- =======================
-- CREATE: NOTIFICATIONS
-- =======================
CREATE TABLE dbo.notifications
(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id NVARCHAR(50) NOT NULL,
  type NVARCHAR(50) NOT NULL,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NULL,
  link NVARCHAR(500) NULL,
  is_read BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_notifications_user ON dbo.notifications(user_id);
CREATE NONCLUSTERED INDEX ix_notifications_read ON dbo.notifications(is_read);
CREATE NONCLUSTERED INDEX ix_notifications_created ON dbo.notifications(created_at);
GO

-- =======================
-- CREATE: SYSTEM SETTINGS
-- =======================
CREATE TABLE dbo.system_settings
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  setting_key NVARCHAR(100) NOT NULL UNIQUE,
  setting_value NVARCHAR(MAX) NULL,
  description NVARCHAR(MAX) NULL,
  updated_by NVARCHAR(50) NULL,
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by) REFERENCES dbo.[users](id) ON DELETE NO ACTION
);
GO

-- =======================
-- CREATE: AUDIT LOGS
-- =======================
CREATE TABLE dbo.audit_logs
(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id NVARCHAR(50) NULL,
  action NVARCHAR(100) NOT NULL,
  entity_type NVARCHAR(100) NULL,
  entity_id NVARCHAR(100) NULL,
  old_values NVARCHAR(MAX) NULL,
  new_values NVARCHAR(MAX) NULL,
  ip_address NVARCHAR(50) NULL,
  user_agent NVARCHAR(500) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES dbo.[users](id) ON DELETE NO ACTION,
  CONSTRAINT chk_audit_old_json CHECK (old_values IS NULL OR ISJSON(old_values) = 1),
  CONSTRAINT chk_audit_new_json CHECK (new_values IS NULL OR ISJSON(new_values) = 1)
);
GO
CREATE NONCLUSTERED INDEX ix_audit_logs_user ON dbo.audit_logs(user_id);
CREATE NONCLUSTERED INDEX ix_audit_logs_action ON dbo.audit_logs(action);
CREATE NONCLUSTERED INDEX ix_audit_logs_entity ON dbo.audit_logs(entity_type, entity_id);
CREATE NONCLUSTERED INDEX ix_audit_logs_created ON dbo.audit_logs(created_at);
GO

-- =======================
-- TRIGGERS: SAFE updated_at handlers
-- (Do not override updated_at if client explicitly provided it)
-- =======================

-- Users
CREATE TRIGGER dbo.trg_users_updated_at
ON dbo.[users]
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE u
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.[users] u
    JOIN inserted i ON u.id = i.id;
END;
GO

-- Students
CREATE TRIGGER dbo.trg_students_updated_at
ON dbo.students
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE s
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.students s
    JOIN inserted i ON s.id = i.id;
END;
GO

-- Topics
CREATE TRIGGER dbo.trg_topics_updated_at
ON dbo.topics
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE t
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.topics t
    JOIN inserted i ON t.id = i.id;
END;
GO

-- Progress reports
CREATE TRIGGER dbo.trg_progress_reports_updated_at
ON dbo.progress_reports
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE p
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.progress_reports p
    JOIN inserted i ON p.id = i.id;
END;
GO

-- Internship registrations
CREATE TRIGGER dbo.trg_internship_registrations_updated_at
ON dbo.internship_registrations
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE ir
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.internship_registrations ir
    JOIN inserted i ON ir.id = i.id;
END;
GO

-- Defense assignments
CREATE TRIGGER dbo.trg_defense_assignments_updated_at
ON dbo.defense_assignments
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE d
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.defense_assignments d
    JOIN inserted i ON d.id = i.id;
END;
GO

-- Companies
CREATE TRIGGER dbo.trg_companies_updated_at
ON dbo.companies
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE c
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.companies c
    JOIN inserted i ON c.id = i.id;
END;
GO

-- Resources
CREATE TRIGGER dbo.trg_resources_updated_at
ON dbo.resources
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE r
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.resources r
    JOIN inserted i ON r.id = i.id;
END;
GO

-- Grades
CREATE TRIGGER dbo.trg_grades_updated_at
ON dbo.grades
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF UPDATE(updated_at)
    RETURN;

  UPDATE g
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.grades g
    JOIN inserted i ON g.id = i.id;
END;
GO

-- =======================
-- FINAL NOTES:
-- 1) All FK constraints are created inline in table definitions above, with ON DELETE NO ACTION
--    or NO ACTION to avoid multiple-cascade-path errors. Only refresh_tokens uses CASCADE (intentional).
-- 2) If you need specific FKs to have ON DELETE NO ACTION, identify them explicitly and ensure
--    there are no alternate cascade paths to the same target. SQL Server rejects multiple cascade paths.
-- 3) Monitor performance and add more targeted indexes based on actual query patterns.
-- 4) Consider storing refresh tokens hashed (we use token_hash column name above); never store raws if avoidable.
-- 5) If you need any FK changed to CASCADE or permissions/grants added, tell me which ones and I'll adjust.
-- 6) Run this script on a staging copy first.

PRINT 'Schema creation completed.';
GO

-- =======================
-- CREATE: DEFENSE REGISTRATIONS
-- =======================
CREATE TABLE dbo.defense_registrations
(
  id INT IDENTITY(1,1) PRIMARY KEY,
  session_id INT NOT NULL,
  student_id INT NOT NULL,
  student_code NVARCHAR(50) NULL,
  student_name NVARCHAR(255) NULL,
  class_name NVARCHAR(100) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  rowversion_col rowversion,
  CONSTRAINT fk_defense_registrations_session FOREIGN KEY (session_id) REFERENCES dbo.defense_sessions(id) ON DELETE NO ACTION,
  CONSTRAINT fk_defense_registrations_student FOREIGN KEY (student_id) REFERENCES dbo.students(id) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX ix_defense_registrations_session ON dbo.defense_registrations(session_id);
CREATE NONCLUSTERED INDEX ix_defense_registrations_student ON dbo.defense_registrations(student_id);
GO
