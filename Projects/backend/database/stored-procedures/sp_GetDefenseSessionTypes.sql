CREATE OR ALTER PROCEDURE sp_GetDefenseSessionTypes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [id] as session_type, [name] AS display_name
    from [dbo].[session_type]
    where is_active=1 and id is not null
    ORDER BY session_type;
END
GO
GO
