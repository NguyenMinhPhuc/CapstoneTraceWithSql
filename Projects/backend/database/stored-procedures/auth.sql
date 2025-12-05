-- =======================
-- AUTHENTICATION STORED PROCEDURES
-- =======================

-- Procedure: sp_RegisterUser
-- Description: Register a new user with role-specific profile
GO
CREATE OR ALTER PROCEDURE sp_RegisterUser
    @email NVARCHAR(255),
    @password_hash NVARCHAR(500),
    @full_name NVARCHAR(255),
    @role NVARCHAR(20),
    @phone NVARCHAR(20) = NULL,
    @student_code NVARCHAR(20) = NULL,
    @class_id INT = NULL,
    @major_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @user_id NVARCHAR(50);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if email already exists
        IF EXISTS (SELECT 1
    FROM users
    WHERE email = @email)
        BEGIN
            THROW 50001, 'Email already exists', 1;
        END

        -- Generate new user ID
        SET @user_id = CAST(NEWID() AS NVARCHAR(50));

        -- Insert user (schema has password_algo, password_version, avatar_url)
        -- Default is_active = 0 (inactive) for new registrations
        INSERT INTO users
        (id, email, password_hash, password_algo, password_version, full_name, role, phone, is_active, created_at, updated_at)
    VALUES
        (@user_id, @email, @password_hash, 'bcrypt', 1, @full_name, @role, @phone, 0, SYSUTCDATETIME(), SYSUTCDATETIME());

        -- Create role-specific profile
        IF @role = 'student' AND @student_code IS NOT NULL
        BEGIN
        -- Check if student code already exists
        IF EXISTS (SELECT 1
        FROM students
        WHERE student_code = @student_code)
            BEGIN
        THROW 50002, 'Student code already exists', 1;
    END

            -- Schema: id, user_id, student_code, class_id, major_id, gpa, status, internship_type
            INSERT INTO students
        (id, user_id, student_code, class_id, major_id, status, created_at, updated_at)
    VALUES
        (NEWID(), @user_id, @student_code, @class_id, @major_id, 'active', SYSUTCDATETIME(), SYSUTCDATETIME());
        END
    ELSE
    IF @role = 'supervisor'
        BEGIN
        -- Schema: id, user_id, department, title, max_students, current_students, specializations
        INSERT INTO supervisors
            (id, user_id, max_students, current_students, created_at, updated_at)
        VALUES
            (NEWID(), @user_id, 10, 0, SYSUTCDATETIME(), SYSUTCDATETIME());
    END

    -- Return the created user ID and info
    SELECT @user_id as user_id, id, email, full_name, role, phone, is_active, created_at, updated_at
    FROM users
    WHERE id = @user_id;

    COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
    IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
    THROW;
    END CATCH
END
GO

-- Procedure: sp_GetUserByEmail
-- Description: Get user by email for authentication
GO
CREATE OR ALTER PROCEDURE sp_GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, email, password_hash, full_name, role, phone, is_active, created_at, updated_at, last_login
    FROM users
    WHERE email = @email;
END
GO

-- Procedure: sp_GetUserById
-- Description: Get user by ID
GO
CREATE OR ALTER PROCEDURE sp_GetUserById
    @user_id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, email, password_hash, full_name, role, phone, is_active, created_at, updated_at, last_login
    FROM users
    WHERE id = @user_id;
END
GO

-- Procedure: sp_SaveRefreshToken
-- Description: Save refresh token for user
GO
CREATE OR ALTER PROCEDURE sp_SaveRefreshToken
    @user_id NVARCHAR(50),
    @token_hash NVARCHAR(500),
    @expires_at DATETIME2,
    @created_ip NVARCHAR(50) = NULL,
    @created_user_agent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Delete old tokens for this user
        DELETE FROM refresh_tokens WHERE user_id = @user_id;

        -- Insert new token (schema uses token_hash, token_algo)
        INSERT INTO refresh_tokens
        (user_id, token, token_algo, expires_at, created_at, created_ip, created_user_agent)
    VALUES
        (@user_id, @token_hash, 'sha256', @expires_at, SYSUTCDATETIME(), @created_ip, @created_user_agent);

        -- Return the token ID
        SELECT SCOPE_IDENTITY() AS token_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Procedure: sp_UpdateLastLogin
-- Description: Update user's last login time
GO
CREATE OR ALTER PROCEDURE sp_UpdateLastLogin
    @user_id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE users
    SET last_login = GETDATE()
    WHERE id = @user_id;
END
GO

-- Procedure: sp_GetRefreshToken
-- Description: Get and validate refresh token
GO
CREATE OR ALTER PROCEDURE sp_GetRefreshToken
    @token_hash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT rt.id, rt.user_id, rt.token, rt.expires_at, rt.created_at,
        u.email, u.full_name, u.role, u.is_active
    FROM refresh_tokens rt
        INNER JOIN users u ON rt.user_id = u.id
    WHERE rt.token = @token_hash
        AND rt.expires_at > SYSUTCDATETIME()
        AND u.is_active = 1;
END
GO

-- Procedure: sp_DeleteRefreshToken
-- Description: Delete refresh token (logout)
GO
CREATE OR ALTER PROCEDURE sp_DeleteRefreshToken
    @token_hash NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM refresh_tokens
    WHERE token = @token_hash;

    SELECT @@ROWCOUNT AS rows_affected;
END
GO

-- Procedure: sp_DeleteUserRefreshTokens
-- Description: Delete all refresh tokens for a user
GO
CREATE OR ALTER PROCEDURE sp_DeleteUserRefreshTokens
    @user_id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM refresh_tokens
    WHERE user_id = @user_id;

    SELECT @@ROWCOUNT AS rows_affected;
END
GO

-- Procedure: sp_ChangePassword
-- Description: Change user password
GO
CREATE OR ALTER PROCEDURE sp_ChangePassword
    @user_id NVARCHAR(50),
    @new_password_hash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Update password
        UPDATE users
        SET password_hash = @new_password_hash,
            updated_at = GETDATE()
        WHERE id = @user_id;

        IF @@ROWCOUNT = 0
        BEGIN
            THROW 50004, 'User not found', 1;
        END

        -- Delete all refresh tokens to force re-login
        DELETE FROM refresh_tokens WHERE user_id = @user_id;

        COMMIT TRANSACTION;
        SELECT 1 AS success;
    END
    TRY
    BEGIN CATCH
    IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
    THROW;
    END CATCH
END
GO

-- Procedure: sp_GetUserProfile
-- Description: Get complete user profile with role-specific data
GO
CREATE OR ALTER PROCEDURE sp_GetUserProfile
    @user_id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Get user basic info with role-specific data
    SELECT u.id, u.email, u.full_name, u.role, u.phone, u.avatar_url, u.is_active,
        u.created_at, u.updated_at, u.last_login,
        -- Student info (schema fields: student_code, class_id, major_id, gpa, status, internship_type)
        s.student_code, s.class_id, s.major_id, s.gpa, s.status as student_status, s.internship_type,
        c.name as class_name, c.code as class_code,
        m.name as major_name, m.code as major_code,
        -- Supervisor info (schema fields: department, title, max_students, current_students, specializations)
        sup.department, sup.title, sup.max_students, sup.current_students, sup.specializations
    FROM users u
        LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN majors m ON s.major_id = m.id
        LEFT JOIN supervisors sup ON u.id = sup.user_id AND u.role = 'supervisor'
    WHERE u.id = @user_id;
END
GO

PRINT 'Authentication stored procedures created successfully!';
