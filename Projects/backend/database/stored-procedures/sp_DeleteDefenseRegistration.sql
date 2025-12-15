-- sp_DeleteDefenseRegistration.sql
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.sp_DeleteDefenseRegistration', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DeleteDefenseRegistration;
GO

CREATE PROCEDURE dbo.sp_DeleteDefenseRegistration
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.defense_registrations WHERE id = @id;
  SELECT @@ROWCOUNT as rowsAffected;
END
GO
