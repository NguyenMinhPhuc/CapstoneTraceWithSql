# ==========================================
# Deploy Company Management System
# Run this script to:
# 1. Apply stored procedures to SQL Server
# 2. Start backend dev server
# 3. Start frontend dev server
# ==========================================

# Color codes for output
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$RED = "`e[31m"
$RESET = "`e[0m"

Write-Host "$GREEN" -NoNewline
Write-Host "========================================" -NoNewline
Write-Host "$RESET"
Write-Host "Company Management System - Deploy Script"
Write-Host "========================================`n"

# Step 1: Ask for SQL Server connection details
Write-Host "$YELLOW[STEP 1]$RESET Apply Stored Procedures to SQL Server`n"

$serverName = Read-Host "Enter SQL Server name (default: localhost)"
if ([string]::IsNullOrWhiteSpace($serverName)) {
    $serverName = "localhost"
}

$dbName = Read-Host "Enter database name (default: CapstoneTrack)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "CapstoneTrack"
}

$useAuth = Read-Host "Use Windows Authentication? (y/n, default: y)"
if ([string]::IsNullOrWhiteSpace($useAuth)) {
    $useAuth = "y"
}

Write-Host "`n$YELLOW[Connecting to SQL Server...]$RESET`n"

$sqlScriptPath = ".\backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"

if (!(Test-Path $sqlScriptPath)) {
    Write-Host "$RED[ERROR] SQL script not found: $sqlScriptPath$RESET"
    Write-Host "Please run this script from the project root directory"
    exit 1
}

# Build sqlcmd command
if ($useAuth.ToLower() -eq "y" -or [string]::IsNullOrWhiteSpace($useAuth)) {
    # Windows Authentication
    Write-Host "Using Windows Authentication...`n"
    $cmd = "sqlcmd -S $serverName -d $dbName -E -i `"$sqlScriptPath`""
} else {
    # SQL Authentication
    $username = Read-Host "Enter SQL username"
    $password = Read-Host "Enter SQL password" -AsSecureString
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password))
    
    $cmd = "sqlcmd -S $serverName -d $dbName -U $username -P `"$plainPassword`" -i `"$sqlScriptPath`""
}

# Execute SQL script
try {
    Invoke-Expression $cmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n$GREEN[SUCCESS]$RESET Stored procedures applied successfully!`n"
    } else {
        Write-Host "`n$RED[WARNING]$RESET sqlcmd exited with code $LASTEXITCODE`n"
        Write-Host "If you see errors above, please verify:"
        Write-Host "  1. SQL Server is running"
        Write-Host "  2. Database 'CapstoneTrack' exists"
        Write-Host "  3. You have permission to create stored procedures`n"
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue.ToLower() -ne "y") {
            exit 1
        }
    }
} catch {
    Write-Host "$RED[ERROR]$RESET Failed to run SQL script: $_`n"
    Write-Host "Make sure you have sqlcmd installed (part of SQL Server tools)`n"
    exit 1
}

# Step 2: Start Backend
Write-Host "$YELLOW[STEP 2]$RESET Starting Backend Dev Server`n"

$backendDir = ".\backend"
if (!(Test-Path $backendDir)) {
    Write-Host "$RED[ERROR]$RESET Backend directory not found: $backendDir$RESET"
    exit 1
}

Write-Host "Installing backend dependencies (if needed)...`n"
Push-Location $backendDir
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "$RED[ERROR]$RESET npm install failed$RESET"
    Pop-Location
    exit 1
}

Write-Host "`n$GREEN[Starting backend on port 5000...]$RESET`n"
Write-Host "Backend is running. Keep this window open.`n"

# Start backend in a new window or in background
$backendProcess = Start-Process npm -ArgumentList "run", "dev" -NoNewWindow -PassThru
Write-Host "$GREEN[Backend started - PID: $($backendProcess.Id)]$RESET`n"

Pop-Location

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Step 3: Start Frontend
Write-Host "$YELLOW[STEP 3]$RESET Starting Frontend Dev Server`n"

Write-Host "Installing frontend dependencies (if needed)...`n"
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "$RED[ERROR]$RESET npm install failed$RESET"
    exit 1
}

Write-Host "`n$GREEN[Starting frontend on port 3000...]$RESET`n"
Write-Host "Frontend is starting...`n"

$frontendProcess = Start-Process npm -ArgumentList "run", "dev" -NoNewWindow -PassThru
Write-Host "$GREEN[Frontend started - PID: $($frontendProcess.Id)]$RESET`n"

# Final instructions
Write-Host "$GREEN" -NoNewline
Write-Host "========================================" -NoNewline
Write-Host "$RESET"
Write-Host "✅ Setup Complete!`n"

Write-Host "$GREEN[Open in your browser:]$RESET"
Write-Host "  http://localhost:3000/admin/companies`n"

Write-Host "$YELLOW[Keep both servers running:]$RESET"
Write-Host "  Backend: http://localhost:5000 (API)"
Write-Host "  Frontend: http://localhost:3000 (Web UI)`n"

Write-Host "$YELLOW[To stop servers, press Ctrl+C in each window]$RESET`n"

Write-Host "$GREEN[Troubleshooting:]$RESET"
Write-Host "  1. If stored procedures fail, check SQL Server is running"
Write-Host "  2. If backend fails, check 'backend/.env' for connection string"
Write-Host "  3. If frontend fails, check port 3000 is not in use"
Write-Host "  4. See COMPANY_MANAGEMENT_GUIDE.md for detailed help`n"

Write-Host "========================================`n"

# Wait for user to stop
Write-Host "Press Enter to view backend logs..."
Read-Host

# Note: In a real scenario, you'd want to wait for processes
# For now, we just provide instructions
