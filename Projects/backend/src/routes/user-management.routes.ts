import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createUser,
  listUsers,
  getUserDetails,
  updateUser,
  updateStudentInfo,
  updateSupervisorInfo,
  deleteUser,
  activateUser,
  resetUserPassword,
  uploadUserAvatar,
} from "../controllers/user-management.controller";
import multer from "multer";
import path from "path";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "avatars"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG or PNG files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [User Management]
 *     summary: Get paginated list of users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email or name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get("/", authenticate, authorize("admin", "manager"), listUsers);

/**
 * @swagger
 * /api/user-management:
 *   post:
 *     tags: [User Management]
 *     summary: Create new user (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, supervisor, student, council_member]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/", authenticate, authorize("admin"), createUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: [User Management]
 *     summary: Get user details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  "/:userId",
  authenticate,
  authorize("admin", "manager"),
  getUserDetails
);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     tags: [User Management]
 *     summary: Update user information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:userId", authenticate, authorize("admin", "manager"), updateUser);

/**
 * @swagger
 * /api/users/student/{studentId}:
 *   put:
 *     tags: [User Management]
 *     summary: Update student information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: integer
 *               majorId:
 *                 type: integer
 *               gpa:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student information updated successfully
 *       404:
 *         description: Student not found
 */
router.put(
  "/student/:studentId",
  authenticate,
  authorize("admin", "manager"),
  updateStudentInfo
);

/**
 * @swagger
 * /api/users/supervisor/{supervisorId}:
 *   put:
 *     tags: [User Management]
 *     summary: Update supervisor information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supervisorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               title:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *               specializations:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supervisor information updated successfully
 *       404:
 *         description: Supervisor not found
 */
router.put(
  "/supervisor/:supervisorId",
  authenticate,
  authorize("admin", "manager"),
  updateSupervisorInfo
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags: [User Management]
 *     summary: Delete user (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:userId", authenticate, authorize("admin"), deleteUser);

/**
 * @swagger
 * /api/users/{userId}/activate:
 *   post:
 *     tags: [User Management]
 *     summary: Activate user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated successfully
 *       404:
 *         description: User not found
 */
router.post(
  "/:userId/activate",
  authenticate,
  authorize("admin"),
  activateUser
);

/**
 * @swagger
 * /api/users/{userId}/avatar:
 *   post:
 *     tags: [User Management]
 *     summary: Upload user avatar (jpg/png)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */
router.post(
  "/:userId/avatar",
  authenticate,
  authorize("admin", "manager"),
  upload.single("avatar"),
  uploadUserAvatar
);

/**
 * @swagger
 * /api/users/{userId}/reset-password:
 *   post:
 *     tags: [User Management]
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 */
router.post(
  "/:userId/reset-password",
  authenticate,
  authorize("admin"),
  resetUserPassword
);

export default router;
