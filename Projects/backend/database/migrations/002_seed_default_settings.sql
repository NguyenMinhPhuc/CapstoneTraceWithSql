-- Insert default system settings
-- Seed data for system_settings table (already exists in schema.sql)

-- Feature toggles
IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'allowStudentRegistration')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('allowStudentRegistration', '1', N'Cho phép sinh viên đăng ký tài khoản mới');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'enableOverallGrading')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('enableOverallGrading', '0', N'Bật chế độ chấm điểm tổng');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'allowEditingApprovedProposal')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('allowEditingApprovedProposal', '0', N'Cho phép sửa thuyết minh đã duyệt');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'forceOpenReportSubmission')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('forceOpenReportSubmission', '0', N'Mở cổng nộp báo cáo bất cứ lúc nào');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'enablePostDefenseSubmission')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('enablePostDefenseSubmission', '0', N'Mở cổng nộp báo cáo sau Hội đồng');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'requireReportApproval')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('requireReportApproval', '1', N'Yêu cầu GVHD duyệt báo cáo cuối kỳ');
END

-- Numeric settings
IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'earlyInternshipGoalHours')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('earlyInternshipGoalHours', '700', N'Số giờ mục tiêu cho chương trình thực tập sớm');
END

-- Theme colors (default)
IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themePrimary')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themePrimary', '#dc2626', N'Màu chính của giao diện');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themePrimaryForeground')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themePrimaryForeground', '#ffffff', N'Màu chữ trên nền màu chính');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themeBackground')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themeBackground', '#f9fafb', N'Màu nền chính của ứng dụng');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themeForeground')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themeForeground', '#0f172a', N'Màu chữ trên nền chính');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themeAccent')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themeAccent', '#facc15', N'Màu nhấn');
END

IF NOT EXISTS (SELECT 1
FROM system_settings
WHERE setting_key = 'themeAccentForeground')
BEGIN
  INSERT INTO system_settings
    (setting_key, setting_value, description)
  VALUES
    ('themeAccentForeground', '#1e293b', N'Màu chữ trên nền màu nhấn');
END

PRINT 'Default settings inserted successfully.';
GO
