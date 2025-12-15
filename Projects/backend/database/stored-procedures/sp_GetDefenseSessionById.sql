IF OBJECT_ID('sp_GetDefenseSessionById','P') IS NOT NULL
  DROP PROCEDURE sp_GetDefenseSessionById;
GO

CREATE PROCEDURE sp_GetDefenseSessionById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT *
  FROM dbo.defense_sessions
  WHERE id = @id;
END
GO
