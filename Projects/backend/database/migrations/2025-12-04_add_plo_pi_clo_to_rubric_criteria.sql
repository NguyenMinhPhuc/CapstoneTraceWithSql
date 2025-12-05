-- Migration: add PLO, PI, CLO columns to rubric_criteria and update stored procedures
-- Run this on your SQL Server against the application's database.

BEGIN TRANSACTION;

-- Add columns if not exists
IF COL_LENGTH('rubric_criteria', 'PLO') IS NULL
BEGIN
  ALTER TABLE rubric_criteria ADD PLO NVARCHAR(255) NULL;
END;
IF COL_LENGTH('rubric_criteria', 'PI') IS NULL
BEGIN
  ALTER TABLE rubric_criteria ADD PI NVARCHAR(255) NULL;
END;
IF COL_LENGTH('rubric_criteria', 'CLO') IS NULL
BEGIN
  ALTER TABLE rubric_criteria ADD CLO NVARCHAR(255) NULL;
END;

-- Replace stored procedures: sp_AddRubricCriterion and sp_UpdateRubricCriterion
-- (This will overwrite existing procedures with new signatures that include PLO/PI/CLO)

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

COMMIT TRANSACTION;
