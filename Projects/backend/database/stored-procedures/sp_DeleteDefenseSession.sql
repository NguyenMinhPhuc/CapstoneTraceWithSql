IF OBJECT_ID('sp_DeleteDefenseSession','P') IS NOT NULL
  DROP PROCEDURE sp_DeleteDefenseSession;
GO

CREATE PROCEDURE sp_DeleteDefenseSession
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.defense_sessions WHERE id = @id;
  SELECT @@ROWCOUNT AS DeletedCount;
END
GO
