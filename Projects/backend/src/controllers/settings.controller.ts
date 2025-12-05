import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import SettingsRepository from "../repositories/settings.repository";
import { AuthRequest } from "../middleware/auth";

export const listSettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const settings = await SettingsRepository.getAll();

    // If no settings found, provide instructions for seeding
    if (settings.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No settings found. Please run the seed script.",
        instructions: {
          step1: "Open SQL Server Management Studio or use sqlcmd",
          step2: "Connect to your database",
          step3:
            "Run the script: backend/database/migrations/002_seed_default_settings.sql",
          sqlcmdExample:
            'sqlcmd -S <SERVER> -d <DATABASE> -U <USER> -P <PASSWORD> -i "backend/database/migrations/002_seed_default_settings.sql"',
        },
      });
    }

    res.status(200).json({ success: true, data: settings });
  }
);

export const getSetting = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const key = req.params.key;
    const setting = await SettingsRepository.get(key);
    if (!setting) throw new AppError("Setting not found", 404);
    res.status(200).json({ success: true, data: setting });
  }
);

export const upsertSetting = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const key = req.params.key;
    const { value, description } = req.body;
    await SettingsRepository.upsert(key, value, description);
    res.status(200).json({ success: true, message: "Setting saved" });
  }
);
