USE [CapstoneTrack]
GO

-- Use existing `defense_sessions` to represent an internship/reporting session.
-- Create internship_positions table (positions offered by companies for a specific defense_session)
-- A company can have MULTIPLE positions per session
IF OBJECT_ID('dbo.internship_positions','U') IS NULL
BEGIN
  CREATE TABLE dbo.internship_positions
  (
    id INT IDENTITY(1,1) NOT NULL,
    defense_session_id INT NOT NULL,
    company_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    capacity INT NOT NULL DEFAULT 1,
    manager_user_id NVARCHAR(50) NULL,
    -- user id of direct manager for this position (teacher for LHU companies)
    is_active BIT NOT NULL DEFAULT 1,
    created_by NVARCHAR(50) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT pk_internship_positions PRIMARY KEY (id),
    CONSTRAINT fk_internship_positions_defense_session FOREIGN KEY (defense_session_id) REFERENCES dbo.defense_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_internship_positions_company FOREIGN KEY (company_id) REFERENCES dbo.companies(id) ON DELETE NO ACTION
  );

  CREATE INDEX ix_internship_positions_session ON dbo.internship_positions(defense_session_id);
  CREATE INDEX ix_internship_positions_company ON dbo.internship_positions(company_id);
  CREATE INDEX ix_internship_positions_session_company ON dbo.internship_positions(defense_session_id, company_id);
END
GO
