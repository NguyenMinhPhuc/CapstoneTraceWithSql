IF OBJECT_ID('sp_GetAllDefenseSessions','P') IS NOT NULL
  DROP PROCEDURE sp_GetAllDefenseSessions;
GO

CREATE PROCEDURE sp_GetAllDefenseSessions
  @session_type NVARCHAR(100) = NULL,
  @status NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT ds.*, st.name as session_type_name
  FROM dbo.defense_sessions ds
    LEFT JOIN dbo.session_type st ON ds.session_type = st.id
  WHERE (@session_type IS NULL OR ds.session_type = @session_type)
    AND (@status IS NULL OR ds.status = @status)
  ORDER BY ds.start_date DESC, ds.id;
END
GO
