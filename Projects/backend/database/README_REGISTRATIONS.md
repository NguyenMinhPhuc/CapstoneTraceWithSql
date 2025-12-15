# Registration SQL Scripts — How to apply

This directory contains the SQL objects for `defense_registrations` and related stored procedures.

Files:
- `schema.sql` — updated schema including `dbo.defense_registrations` table. Append-only; run on staging first.
- `stored-procedures/sp_CreateDefenseRegistration.sql`
- `stored-procedures/sp_GetDefenseRegistrationsBySession.sql`
- `stored-procedures/sp_DeleteDefenseRegistration.sql`

Recommended order to apply on a Windows machine (PowerShell):

1) Run the schema script (creates the table):

```powershell
# Using sqlcmd (SQL Server tools must be installed)
$sqlServer = "<SERVER_NAME>"  # e.g., localhost\SQLEXPRESS or tcp:db.example.com,1433
$database = "<DATABASE_NAME>"
$user = "<DB_USER>"
$pass = "<DB_PASSWORD>"
sqlcmd -S $sqlServer -d $database -U $user -P $pass -i .\backend\database\schema.sql
```

Or using `Invoke-Sqlcmd` (SQLServer PowerShell module):

```powershell
Invoke-Sqlcmd -ServerInstance $sqlServer -Database $database -Username $user -Password $pass -InputFile .\backend\database\schema.sql
```

2) Run stored procedure scripts (order not critical, but create first):

```powershell
sqlcmd -S $sqlServer -d $database -U $user -P $pass -i .\backend\database\stored-procedures\sp_CreateDefenseRegistration.sql
sqlcmd -S $sqlServer -d $database -U $user -P $pass -i .\backend\database\stored-procedures\sp_GetDefenseRegistrationsBySession.sql
sqlcmd -S $sqlServer -d $database -U $user -P $pass -i .\backend\database\stored-procedures\sp_DeleteDefenseRegistration.sql
```

3) After applying scripts, restart backend server (if running) so any cached metadata is refreshed.

Notes:
- Always run on a staging environment first.
- If your environment uses integrated Windows auth, omit `-U` and `-P` and use `-E` for trusted connection with `sqlcmd`.
- If your DB connection string is available to the backend, you can also run these scripts using your DB admin tooling.

If you want, I can also:
- Execute these scripts from this environment if you provide DB connection details (server, database, user, password).
- Add migrations or a script to run these automatically on startup.

Once the DB objects are in place, the backend endpoints are available:
- `GET /api/defense/sessions/:sessionId/registrations`
- `POST /api/defense/sessions/:sessionId/registrations`
- `DELETE /api/defense/registrations/:id`

Front-end changes in this branch call these endpoints via `src/services/defense.service.ts`.
