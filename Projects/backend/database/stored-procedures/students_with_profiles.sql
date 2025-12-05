-- Stored procedure to return paged students with profile info and total count
SET NOCOUNT ON;

IF OBJECT_ID('dbo.sp_GetStudentsWithProfilePaged','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_GetStudentsWithProfilePaged;
GO
CREATE PROCEDURE dbo.sp_GetStudentsWithProfilePaged
  @page INT,
  @pageSize INT,
  @q NVARCHAR(255) = NULL,
  @className NVARCHAR(255) = NULL,
  @profile NVARCHAR(10) = 'all',
  -- 'all' | 'has' | 'no'
  @sortBy NVARCHAR(50) = 'student_code',
  @sortDir NVARCHAR(4) = 'asc'
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INT = (@page - 1) * @pageSize;
  DECLARE @where NVARCHAR(MAX) = N'';

  IF @q IS NOT NULL AND LTRIM(RTRIM(@q)) <> ''
    SET @where = @where + N' AND (s.student_code LIKE ''%'' + @q + ''%'' OR s.full_name LIKE ''%'' + @q + ''%'' OR c.class_name LIKE ''%'' + @q + ''%'')';

  IF @className IS NOT NULL AND LTRIM(RTRIM(@className)) <> ''
    SET @where = @where + N' AND c.class_name = @className';

  IF LOWER(@profile) = 'has'
    SET @where = @where + N' AND sp.student_id IS NOT NULL';
  ELSE IF LOWER(@profile) = 'no'
    SET @where = @where + N' AND sp.student_id IS NULL';

  -- Whitelist sort columns
  DECLARE @orderCol NVARCHAR(50) = CASE
    WHEN @sortBy = 'full_name' THEN 's.full_name'
    WHEN @sortBy = 'class_name' THEN 'c.class_name'
    ELSE 's.student_code'
  END;

  DECLARE @orderDir NVARCHAR(4) = CASE WHEN LOWER(@sortDir) = 'desc' THEN 'DESC' ELSE 'ASC' END;

  DECLARE @sql NVARCHAR(MAX) = N'
    SELECT s.id, s.student_code, s.full_name, c.class_name, CASE WHEN sp.student_id IS NULL THEN 0 ELSE 1 END AS has_profile, COUNT(1) OVER() AS total_count
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN student_profiles sp ON sp.student_id = s.id
    WHERE 1=1 '
    + @where + N'
    ORDER BY ' + @orderCol + N' ' + @orderDir + N'
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;';

  EXEC sp_executesql @sql,
    N'@q NVARCHAR(255), @className NVARCHAR(255), @offset INT, @pageSize INT',
    @q = @q,
    @className = @className,
    @offset = @offset,
    @pageSize = @pageSize;
END;
GO
