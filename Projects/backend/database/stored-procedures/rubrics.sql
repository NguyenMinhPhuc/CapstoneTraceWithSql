-- ==============================================
-- Rubrics Management Stored Procedures
-- Tables: rubrics, rubric_criteria
-- ==============================================

-- List rubrics with pagination and optional filters
IF OBJECT_ID('sp_GetRubrics', 'P') IS NOT NULL DROP PROCEDURE sp_GetRubrics;
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
END;
GO

-- Get single rubric with criteria
IF OBJECT_ID('sp_GetRubricById', 'P') IS NOT NULL DROP PROCEDURE sp_GetRubricById;
GO
CREATE PROCEDURE sp_GetRubricById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1
    *
  FROM rubrics
  WHERE id = @id;
  SELECT *
  FROM rubric_criteria
  WHERE rubric_id = @id
  ORDER BY order_index, id;
END;
GO

-- Create rubric
IF OBJECT_ID('sp_CreateRubric', 'P') IS NOT NULL DROP PROCEDURE sp_CreateRubric;
GO
CREATE PROCEDURE sp_CreateRubric
  @name NVARCHAR(255),
  @rubric_type NVARCHAR(50),
  @description NVARCHAR(MAX) = NULL,
  @total_score DECIMAL(5,2) = 100.00,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO rubrics
    (name, rubric_type, description, total_score, is_active)
  VALUES
    (@name, @rubric_type, @description, @total_score, @is_active);
  SELECT SCOPE_IDENTITY() AS id;
END;
GO

-- Update rubric
IF OBJECT_ID('sp_UpdateRubric', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateRubric;
GO
CREATE PROCEDURE sp_UpdateRubric
  @id INT,
  @name NVARCHAR(255),
  @rubric_type NVARCHAR(50),
  @description NVARCHAR(MAX) = NULL,
  @total_score DECIMAL(5,2) = 100.00,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE rubrics
  SET
    name = @name,
    rubric_type = @rubric_type,
    description = @description,
    total_score = @total_score,
    is_active = @is_active,
    updated_at = GETDATE()
  WHERE id = @id;
  SELECT @@ROWCOUNT AS affected;
END;
GO

-- Delete rubric (hard delete, cascades criteria)
IF OBJECT_ID('sp_DeleteRubric', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteRubric;
GO
CREATE PROCEDURE sp_DeleteRubric
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM rubrics WHERE id = @id;
  SELECT @@ROWCOUNT AS affected;
END;
GO

-- Add criterion
IF OBJECT_ID('sp_AddRubricCriterion', 'P') IS NOT NULL DROP PROCEDURE sp_AddRubricCriterion;
GO
CREATE PROCEDURE sp_AddRubricCriterion
  @rubric_id INT,
  @name NVARCHAR(500),
  @description NVARCHAR(MAX) = NULL,
  @PLO NVARCHAR(255) = NULL,
  @PI NVARCHAR(255) = NULL,
  @CLO NVARCHAR(255) = NULL,
  @max_score DECIMAL(5,2),
  @weight DECIMAL(5,2) = NULL,
  @order_index INT = 0
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO rubric_criteria
    (rubric_id, name, description, PLO, PI, CLO, max_score, weight, order_index)
  VALUES
    (@rubric_id, @name, @description, @PLO, @PI, @CLO, @max_score, @weight, @order_index);
  SELECT SCOPE_IDENTITY() AS id;
END;
GO

-- Update criterion
IF OBJECT_ID('sp_UpdateRubricCriterion', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateRubricCriterion;
GO
CREATE PROCEDURE sp_UpdateRubricCriterion
  @id INT,
  @name NVARCHAR(500),
  @description NVARCHAR(MAX) = NULL,
  @PLO NVARCHAR(255) = NULL,
  @PI NVARCHAR(255) = NULL,
  @CLO NVARCHAR(255) = NULL,
  @max_score DECIMAL(5,2),
  @weight DECIMAL(5,2) = NULL,
  @order_index INT = 0
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE rubric_criteria
  SET
    name = @name,
    description = @description,
    PLO = @PLO,
    PI = @PI,
    CLO = @CLO,
    max_score = @max_score,
    weight = @weight,
    order_index = @order_index
  WHERE id = @id;
  SELECT @@ROWCOUNT AS affected;
END;
GO

-- Delete criterion
IF OBJECT_ID('sp_DeleteRubricCriterion', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteRubricCriterion;
GO
CREATE PROCEDURE sp_DeleteRubricCriterion
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM rubric_criteria WHERE id = @id;
  SELECT @@ROWCOUNT AS affected;
END;
GO

-- Get criteria by rubric
IF OBJECT_ID('sp_GetRubricCriteriaByRubricId', 'P') IS NOT NULL DROP PROCEDURE sp_GetRubricCriteriaByRubricId;
GO
CREATE PROCEDURE sp_GetRubricCriteriaByRubricId
  @rubric_id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT *
  FROM rubric_criteria
  WHERE rubric_id = @rubric_id
  ORDER BY order_index, id;
END;
GO
