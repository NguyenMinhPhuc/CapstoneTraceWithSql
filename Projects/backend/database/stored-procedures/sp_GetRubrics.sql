IF OBJECT_ID('sp_GetRubrics','P') IS NOT NULL
  DROP PROCEDURE sp_GetRubrics;
GO

CREATE PROCEDURE sp_GetRubrics
  @page INT = 1,
  @pageSize INT = 10,
  @rubric_type NVARCHAR(50) = NULL,
  @search NVARCHAR(255) = NULL,
  @isActive BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @offset INT = (@page - 1) * @pageSize;

  SELECT
    r.id,
    r.name,
    r.rubric_type,
    r.description,
    r.total_score,
    r.is_active,
    r.created_at,
    r.updated_at,
    (SELECT COUNT(*)
    FROM rubric_criteria c
    WHERE c.rubric_id = r.id) AS criteria_count
  FROM rubrics r
  WHERE
    (@rubric_type IS NULL OR r.rubric_type = @rubric_type)
    AND (@isActive IS NULL OR r.is_active = @isActive)
    AND (
      @search IS NULL OR r.name LIKE '%' + @search + '%' OR r.description LIKE '%' + @search + '%'
    )
  ORDER BY r.created_at DESC
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;

  SELECT COUNT(*) AS total
  FROM rubrics r
  WHERE
    (@rubric_type IS NULL OR r.rubric_type = @rubric_type)
    AND (@isActive IS NULL OR r.is_active = @isActive)
    AND (
      @search IS NULL OR r.name LIKE '%' + @search + '%' OR r.description LIKE '%' + @search + '%'
    );
END
GO