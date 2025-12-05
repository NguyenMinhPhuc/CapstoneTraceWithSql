import { getPool } from "../database/connection";

export interface Setting {
  key: string;
  value: string | null;
  description?: string | null;
  updated_at?: string;
}

export class SettingsRepository {
  static async getAll(): Promise<Setting[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .query(
        "SELECT setting_key AS [key], setting_value AS [value], description, updated_at FROM system_settings"
      );
    return result.recordset as Setting[];
  }

  static async get(key: string): Promise<Setting | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("key", key)
      .query(
        "SELECT setting_key AS [key], setting_value AS [value], description, updated_at FROM system_settings WHERE setting_key = @key"
      );
    return result.recordset.length ? (result.recordset[0] as Setting) : null;
  }

  static async upsert(
    key: string,
    value: string | null,
    description?: string | null
  ): Promise<void> {
    const pool = getPool();
    // Use MERGE for upsert
    await pool
      .request()
      .input("key", key)
      .input("value", value)
      .input("description", description).query(`
        MERGE system_settings AS target
        USING (SELECT @key AS setting_key, @value AS setting_value, @description AS description) AS src
        ON (target.setting_key = src.setting_key)
        WHEN MATCHED THEN
          UPDATE SET setting_value = src.setting_value, description = src.description, updated_at = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (setting_key, setting_value, description, updated_at) VALUES (src.setting_key, src.setting_value, src.description, SYSUTCDATETIME());
      `);
  }
}

export default SettingsRepository;
