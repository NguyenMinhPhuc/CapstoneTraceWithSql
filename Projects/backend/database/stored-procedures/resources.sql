-- ==============================================
-- Resources Management Stored Procedures
-- ==============================================

-- Get all resources with pagination and filtering
IF OBJECT_ID('sp_GetResources', 'P') IS NOT NULL DROP PROCEDURE sp_GetResources;
GO
CREATE PROCEDURE sp_GetResources
  @page INT = 1,
  @pageSize INT = 10,
  @category NVARCHAR(50) = NULL,
  @search NVARCHAR(255) = NULL,
  @isActive BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INT = (@page - 1) * @pageSize;

  SELECT
    r.id,
    r.name,
    r.summary,
    r.category,
    r.resource_type,
    r.created_by,
    r.is_active,
    r.created_at,
    r.updated_at,
    u.full_name as creator_name,
    (SELECT COUNT(*)
    FROM resource_links
    WHERE resource_id = r.id) as links_count
  FROM resources r
    LEFT JOIN [users] u ON r.created_by = u.id
  WHERE
    (@category IS NULL OR r.category = @category)
    AND (@search IS NULL OR r.name LIKE '%' + @search + '%' OR r.summary LIKE '%' + @search + '%')
    AND (@isActive IS NULL OR r.is_active = @isActive)
  ORDER BY r.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;

  -- Get total count
  SELECT COUNT(*) as total
  FROM resources r
  WHERE
    (@category IS NULL OR r.category = @category)
    AND (@search IS NULL OR r.name LIKE '%' + @search + '%' OR r.summary LIKE '%' + @search + '%')
    AND (@isActive IS NULL OR r.is_active = @isActive);
END;
GO

-- Get resource by ID with links
IF OBJECT_ID('sp_GetResourceById', 'P') IS NOT NULL DROP PROCEDURE sp_GetResourceById;
GO
CREATE PROCEDURE sp_GetResourceById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    r.id,
    r.name,
    r.summary,
    r.category,
    r.resource_type,
    r.created_by,
    r.is_active,
    r.created_at,
    r.updated_at,
    u.full_name as creator_name
  FROM resources r
    LEFT JOIN [users] u ON r.created_by = u.id
  WHERE r.id = @id;

  -- Get links for this resource
  SELECT
    id,
    resource_id,
    label,
    url,
    order_index,
    created_at
  FROM resource_links
  WHERE resource_id = @id
  ORDER BY order_index ASC, created_at ASC;
END;
GO

-- Create resource
IF OBJECT_ID('sp_CreateResource', 'P') IS NOT NULL DROP PROCEDURE sp_CreateResource;
GO
CREATE PROCEDURE sp_CreateResource
  @name NVARCHAR(255),
  @summary NVARCHAR(MAX),
  @category NVARCHAR(50),
  @resource_type NVARCHAR(50),
  @created_by NVARCHAR(50),
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO resources
    (name, summary, category, resource_type, created_by, is_active)
  VALUES
    (@name, @summary, @category, @resource_type, @created_by, @is_active);

  SELECT SCOPE_IDENTITY() as id;
END;
GO

-- Update resource
IF OBJECT_ID('sp_UpdateResource', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateResource;
GO
CREATE PROCEDURE sp_UpdateResource
  @id INT,
  @name NVARCHAR(255),
  @summary NVARCHAR(MAX),
  @category NVARCHAR(50),
  @resource_type NVARCHAR(50),
  @is_active BIT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE resources
  SET
    name = @name,
    summary = @summary,
    category = @category,
    resource_type = @resource_type,
    is_active = @is_active,
    updated_at = SYSUTCDATETIME()
  WHERE id = @id;

  SELECT @@ROWCOUNT as affected_rows;
END;
GO

-- Delete resource
IF OBJECT_ID('sp_DeleteResource', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteResource;
GO
CREATE PROCEDURE sp_DeleteResource
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Delete all links first
    DELETE FROM resource_links WHERE resource_id = @id;

    -- Delete resource
    DELETE FROM resources WHERE id = @id;

    COMMIT TRANSACTION;
    SELECT @@ROWCOUNT as affected_rows;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;
GO

-- Add link to resource
IF OBJECT_ID('sp_AddResourceLink', 'P') IS NOT NULL DROP PROCEDURE sp_AddResourceLink;
GO
CREATE PROCEDURE sp_AddResourceLink
  @resource_id INT,
  @label NVARCHAR(255),
  @url NVARCHAR(1000),
  @order_index INT = 0
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO resource_links
    (resource_id, label, url, order_index)
  VALUES
    (@resource_id, @label, @url, @order_index);

  SELECT SCOPE_IDENTITY() as id;
END;
GO

-- Update resource link
IF OBJECT_ID('sp_UpdateResourceLink', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateResourceLink;
GO
CREATE PROCEDURE sp_UpdateResourceLink
  @id INT,
  @label NVARCHAR(255),
  @url NVARCHAR(1000),
  @order_index INT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE resource_links
  SET
    label = @label,
    url = @url,
    order_index = @order_index
  WHERE id = @id;

  SELECT @@ROWCOUNT as affected_rows;
END;
GO

-- Delete resource link
IF OBJECT_ID('sp_DeleteResourceLink', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteResourceLink;
GO
CREATE PROCEDURE sp_DeleteResourceLink
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM resource_links WHERE id = @id;

  SELECT @@ROWCOUNT as affected_rows;
END;
GO

PRINT 'Resources stored procedures created successfully.';
