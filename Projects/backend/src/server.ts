import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { connectDatabase } from "./database/connection";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./config/swagger";
import path from "path";
import fs from "fs";

// Import routes
import authRoutes from "./routes/auth.routes";
import userManagementRoutes from "./routes/user-management.routes";
import profileRoutes from "./routes/profile.routes";
import settingsRoutes from "./routes/settings.routes";
import resourcesRoutes from "./routes/resources.routes";
import rubricsRoutes from "./routes/rubrics.routes";
import departmentsRoutes from "./routes/departments.routes";
import majorsRoutes from "./routes/majors.routes";
import classesRoutes from "./routes/classes.routes";
import studentsRoutes from "./routes/students.routes";
import supervisorRoutes from "./routes/supervisor.routes";
import companiesRoutes from "./routes/companies.routes";
import studentProfilesRoutes from "./routes/studentProfiles.routes";
import classAdvisorsRoutes from "./routes/classAdvisors.routes";
// import userRoutes from "./routes/user.routes";
// import topicRoutes from "./routes/topic.routes";
// import companyRoutes from "./routes/company.routes";
// import internshipRoutes from "./routes/internship.routes";
// import progressReportRoutes from "./routes/progressReport.routes";
// import defenseRoutes from "./routes/defense.routes";
// import gradingRoutes from "./routes/grading.routes";
// import resourceRoutes from "./routes/resource.routes";
// import conversationRoutes from "./routes/conversation.routes";
// import notificationRoutes from "./routes/notification.routes";
// import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
// Prefer per-user key when JWT present (reduces 429s for many users behind same IP)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests, please try again later.",
  keyGenerator: (req) => {
    try {
      const auth = req.headers.authorization?.replace("Bearer ", "");
      if (auth) {
        const decoded = jwt.decode(auth) as any;
        if (decoded && decoded.id) return String(decoded.id);
      }
    } catch (e) {
      // fall back to IP
    }
    return req.ip;
  },
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Ensure uploads directories exist before serving
const uploadsDir = path.join(process.cwd(), "uploads");
const avatarsDir = path.join(uploadsDir, "avatars");
try {
  fs.mkdirSync(avatarsDir, { recursive: true });
} catch (e) {
  logger.warn("Could not ensure uploads directories:", e);
}
// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "CapstoneTrack API Documentation",
  })
);

// Swagger JSON
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user-management", userManagementRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/rubrics", rubricsRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/majors", majorsRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/supervisors", supervisorRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/student-profiles", studentProfilesRoutes);
app.use("/api/class-advisors", classAdvisorsRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/topics", topicRoutes);
// app.use("/api/companies", companyRoutes);
// app.use("/api/internships", internshipRoutes);
// app.use("/api/progress-reports", progressReportRoutes);
// app.use("/api/defense", defenseRoutes);
// app.use("/api/grading", gradingRoutes);
// app.use("/api/resources", resourceRoutes);
// app.use("/api/conversations", conversationRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/admin", adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 API available at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
