import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../controllers/profile.controller";
import multer from "multer";
import path from "path";

const router = Router();

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "avatars"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype))
      return cb(new Error("Only JPG or PNG files are allowed"));
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get("/", authenticate, getMyProfile);
router.put("/", authenticate, updateMyProfile);
router.post("/avatar", authenticate, upload.single("avatar"), uploadMyAvatar);

export default router;
