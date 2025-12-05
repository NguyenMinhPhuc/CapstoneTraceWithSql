-- =============================================
-- User Management Stored Procedures
-- =============================================

-- Procedure: sp_ListUsers
-- Description: Get paginated list of users with role-specific data
GO
CREATE OR ALTER PROCEDURE sp_ListUsers
  @page INT = 1,
  @page_size INT = 10,
  @search NVARCHAR(255) = NULL,
  @role NVARCHAR(50) = NULL,
  @is_active BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INT = (@page - 1) * @page_size;

  -- Get total count
  DECLARE @total_count INT;
  SELECT @total_count = COUNT(*)
  FROM users u
  WHERE (@search IS NULL OR u.email LIKE '%' + @search + '%' OR u.full_name LIKE '%' + @search + '%')
    AND (@role IS NULL OR u.role = @role)
    AND (@is_active IS NULL OR u.is_active = @is_active);

  -- Get paginated users with role-specific data
  SELECT
    u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url,
    u.is_active, u.created_at, u.updated_at, u.last_login,
    -- Student data
    s.id as student_id, s.student_code, s.class_id, s.major_id, s.gpa,
    c.name as class_name, m.name as major_name,
    -- Supervisor data
    sup.id as supervisor_id, sup.department, sup.title,
    sup.max_students, sup.current_students, sup.specializations,
    -- Total count for pagination
    @total_count as total_count
  FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN majors m ON s.major_id = m.id
    LEFT JOIN supervisors sup ON u.id = sup.user_id
  WHERE (@search IS NULL OR u.email LIKE '%' + @search + '%' OR u.full_name LIKE '%' + @search + '%')
    AND (@role IS NULL OR u.role = @role)
    AND (@is_active IS NULL OR u.is_active = @is_active)
  ORDER BY u.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @page_size ROWS ONLY;
END
GO

-- Procedure: sp_GetUserDetails
-- Description: Get complete user details including role-specific data
GO
CREATE OR ALTER PROCEDURE sp_GetUserDetails
  @user_id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url,
    u.is_active, u.created_at, u.updated_at, u.last_login,
    -- Student data
    s.id as student_id, s.student_code, s.class_id, s.major_id,
    s.gpa, s.status, s.internship_type,
    c.name as class_name, m.name as major_name,
    -- Supervisor data
    sup.id as supervisor_id, sup.department, sup.title,
    sup.max_students, sup.current_students, sup.specializations
  FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN majors m ON s.major_id = m.id
    LEFT JOIN supervisors sup ON u.id = sup.user_id
  WHERE u.id = @user_id;
END
GO

-- Procedure: sp_UpdateUser
-- Description: Update user information
GO
CREATE OR ALTER PROCEDURE sp_UpdateUser
  @user_id NVARCHAR(50),
  @full_name NVARCHAR(255),
  @phone NVARCHAR(20) = NULL,
  @avatar_url NVARCHAR(500) = NULL,
  @is_active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE users
    SET 
        full_name = @full_name,
        phone = @phone,
        avatar_url = @avatar_url,
        is_active = @is_active,
        updated_at = SYSUTCDATETIME()
    WHERE id = @user_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

-- Procedure: sp_UpdateStudentInfo
-- Description: Update student-specific information
GO
CREATE OR ALTER PROCEDURE sp_UpdateStudentInfo
  @student_id NVARCHAR(50),
  @class_id INT = NULL,
  @major_id INT = NULL,
  @gpa DECIMAL(3,2) = NULL,
  @status NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE students
    SET 
        class_id = COALESCE(@class_id, class_id),
        major_id = COALESCE(@major_id, major_id),
        gpa = COALESCE(@gpa, gpa),
        status = COALESCE(@status, status),
        updated_at = SYSUTCDATETIME()
    WHERE id = @student_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

-- Procedure: sp_UpdateSupervisorInfo
-- Description: Update supervisor-specific information
GO
CREATE OR ALTER PROCEDURE sp_UpdateSupervisorInfo
  @supervisor_id NVARCHAR(50),
  @department NVARCHAR(255) = NULL,
  @title NVARCHAR(100) = NULL,
  @max_students INT = NULL,
  @specializations NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE supervisors
    SET 
        department = COALESCE(@department, department),
        title = COALESCE(@title, title),
        max_students = COALESCE(@max_students, max_students),
        specializations = COALESCE(@specializations, specializations),
        updated_at = SYSUTCDATETIME()
    WHERE id = @supervisor_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

-- Procedure: sp_DeleteUser
-- Description: Soft delete user (set is_active = 0)
GO
CREATE OR ALTER PROCEDURE sp_DeleteUser
  @user_id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE users
    SET 
        is_active = 0,
        updated_at = SYSUTCDATETIME()
    WHERE id = @user_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

-- Procedure: sp_ActivateUser
-- Description: Activate user (set is_active = 1)
GO
CREATE OR ALTER PROCEDURE sp_ActivateUser
  @user_id NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE users
    SET 
        is_active = 1,
        updated_at = SYSUTCDATETIME()
    WHERE id = @user_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

-- Procedure: sp_ResetUserPassword
-- Description: Reset user password (admin function)
GO
CREATE OR ALTER PROCEDURE sp_ResetUserPassword
  @user_id NVARCHAR(50),
  @new_password_hash NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE users
    SET 
        password_hash = @new_password_hash,
        password_algo = 'bcrypt',
        password_version = 1,
        updated_at = SYSUTCDATETIME()
    WHERE id = @user_id;

  -- Delete all refresh tokens to force re-login
  DELETE FROM refresh_tokens WHERE user_id = @user_id;

  SELECT @@ROWCOUNT as rows_affected;
END
GO

PRINT 'User management stored procedures created successfully!';
