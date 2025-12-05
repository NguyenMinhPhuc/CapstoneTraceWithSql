-- =============================================
-- Stored Procedures for Students Management
-- =============================================

-- Get all students with optional filters
GO
CREATE OR ALTER PROCEDURE sp_GetAllStudents
  @class_id INT = NULL,
  @major_id INT = NULL,
  @department_id INT = NULL,
  @status NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    s.id,
    s.student_code,
    s.full_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.gender,
    s.address,
    s.class_id,
    c.name AS class_name,
    c.code AS class_code,
    c.major_id,
    m.name AS major_name,
    m.code AS major_code,
    m.department_id,
    d.name AS department_name,
    d.code AS department_code,
    s.avatar_url,
    s.status,
    s.user_id,
    s.created_at,
    s.updated_at
  FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN majors m ON c.major_id = m.id
    LEFT JOIN departments d ON m.department_id = d.id
  WHERE (@class_id IS NULL OR s.class_id = @class_id)
    AND (@major_id IS NULL OR c.major_id = @major_id)
    AND (@department_id IS NULL OR m.department_id = @department_id)
    AND (@status IS NULL OR s.status = @status)
  ORDER BY s.student_code;
END;
GO

-- Get student by ID
GO
CREATE OR ALTER PROCEDURE sp_GetStudentById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    s.id,
    s.student_code,
    s.full_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.gender,
    s.address,
    s.class_id,
    c.name AS class_name,
    c.code AS class_code,
    c.major_id,
    m.name AS major_name,
    m.code AS major_code,
    m.department_id,
    d.name AS department_name,
    d.code AS department_code,
    s.avatar_url,
    s.status,
    s.user_id,
    s.created_at,
    s.updated_at
  FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN majors m ON c.major_id = m.id
    LEFT JOIN departments d ON m.department_id = d.id
  WHERE s.id = @id;
END;
GO

-- Create a new student (with user account)
GO
CREATE OR ALTER PROCEDURE sp_CreateStudent
  @student_code NVARCHAR(50),
  @full_name NVARCHAR(255),
  @email NVARCHAR(255),
  @phone NVARCHAR(20) = NULL,
  @date_of_birth DATE = NULL,
  @gender NVARCHAR(10) = NULL,
  @address NVARCHAR(MAX) = NULL,
  @class_id INT = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @status NVARCHAR(50) = N'Đang học',
  @password_hash NVARCHAR(500) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @user_id NVARCHAR(50);
  DECLARE @new_id INT;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Check if student code already exists
    IF EXISTS (SELECT 1
  FROM students
  WHERE student_code = @student_code)
    BEGIN
      THROW 50001, 'Student code already exists', 1;
    END

    -- Check if email already exists in users table
    IF EXISTS (SELECT 1
  FROM users
  WHERE email = @email)
    BEGIN
      THROW 50002, 'Email already exists', 1;
    END

  -- Validate status
  IF @status NOT IN (N'Đang học', N'Bảo lưu', N'Nghỉ học', N'Nghỉ học khi tuyển sinh', N'Đã tốt nghiệp')
    BEGIN
  THROW 50004, 'Invalid status value', 1;
END

-- Create user account first using sp_RegisterUser
-- Generate new user ID
SET @user_id = CAST(NEWID() AS NVARCHAR(50));

-- If no password provided, use default (this should be hashed in the application)
IF @password_hash IS NULL
    BEGIN
  -- This is a fallback, password should always be provided from application
  SET @password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyE3H.oUuBNW';
-- 'password123'
END

-- Insert user directly (simplified version of sp_RegisterUser)
INSERT INTO users
  (id, email, password_hash, password_algo, password_version, full_name, role, phone, avatar_url, is_active, created_at, updated_at)
VALUES
  (@user_id, @email, @password_hash, 'bcrypt', 1, @full_name, 'student', @phone, @avatar_url, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

-- Now create student record with user_id
INSERT INTO students
  (
  student_code,
  full_name,
  email,
  phone,
  date_of_birth,
  gender,
  address,
  class_id,
  avatar_url,
  status,
  user_id,
  created_at,
  updated_at
  )
VALUES
  (
    @student_code,
    @full_name,
    @email,
    @phone,
    @date_of_birth,
    @gender,
    @address,
    @class_id,
    @avatar_url,
    @status,
    @user_id,
    GETDATE(),
    GETDATE()
    );

SET @new_id = SCOPE_IDENTITY();

-- Return the created student
SELECT
  s.id,
  s.student_code,
  s.full_name,
  s.email,
  s.phone,
  s.date_of_birth,
  s.gender,
  s.address,
  s.class_id,
  c.name AS class_name,
  c.code AS class_code,
  c.major_id,
  m.name AS major_name,
  m.code AS major_code,
  m.department_id,
  d.name AS department_name,
  d.code AS department_code,
  s.avatar_url,
  s.status,
  s.user_id,
  s.created_at,
  s.updated_at
FROM students s
  LEFT JOIN classes c ON s.class_id = c.id
  LEFT JOIN majors m ON c.major_id = m.id
  LEFT JOIN departments d ON m.department_id = d.id
WHERE s.id = @new_id;

COMMIT TRANSACTION;
END TRY
  BEGIN CATCH
IF @@TRANCOUNT > 0
      ROLLBACK TRANSACTION;
THROW;
END CATCH
END;
GO

-- Update a student
GO
CREATE OR ALTER PROCEDURE sp_UpdateStudent
  @id INT,
  @student_code NVARCHAR(50),
  @full_name NVARCHAR(255),
  @email NVARCHAR(255),
  @phone NVARCHAR(20) = NULL,
  @date_of_birth DATE = NULL,
  @gender NVARCHAR(10) = NULL,
  @address NVARCHAR(MAX) = NULL,
  @class_id INT = NULL,
  @avatar_url NVARCHAR(MAX) = NULL,
  @status NVARCHAR(50) = N'Đang học'
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if student exists
  IF NOT EXISTS (SELECT 1
  FROM students
  WHERE id = @id)
    BEGIN
  THROW 50003, 'Student not found', 1;
  RETURN;
END

-- Check if student code already exists (excluding current student)
IF EXISTS (SELECT 1
FROM students
WHERE student_code = @student_code AND id != @id)
    BEGIN
THROW 50001, 'Student code already exists', 1;
RETURN;
END

-- Check if email already exists (excluding current student)
IF EXISTS (SELECT 1
FROM students
WHERE email = @email AND id != @id)
    BEGIN
THROW 50002, 'Email already exists', 1;
RETURN;
END

-- Validate status
IF @status NOT IN (N'Đang học', N'Bảo lưu', N'Nghỉ học', N'Nghỉ học khi tuyển sinh', N'Đã tốt nghiệp')
    BEGIN
THROW 50004, 'Invalid status value', 1;
RETURN;
END

UPDATE students
    SET 
        student_code = @student_code,
        full_name = @full_name,
        email = @email,
        phone = @phone,
        date_of_birth = @date_of_birth,
        gender = @gender,
        address = @address,
        class_id = @class_id,
        avatar_url = @avatar_url,
        status = @status,
        updated_at = GETDATE()
    WHERE id = @id;

-- Return the updated student
EXEC sp_GetStudentById @id;
END;
GO

-- Delete a student
GO
CREATE OR ALTER PROCEDURE sp_DeleteStudent
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Check if student exists
  IF NOT EXISTS (SELECT 1
  FROM students
  WHERE id = @id)
    BEGIN
  THROW 50003, 'Student not found', 1;
  RETURN;
END

update students set status=N'Nghỉ học' where id=@id;



END;
GO
