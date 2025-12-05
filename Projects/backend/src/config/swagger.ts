import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CapstoneTrack API",
      version: "1.0.0",
      description:
        "API documentation for CapstoneTrack - Capstone and Internship Management System",
      contact: {
        name: "API Support",
        email: "support@capstonetrack.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.capstonetrack.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            fullName: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "supervisor", "student", "council_member"],
            },
            phone: { type: "string" },
            avatar: { type: "string", format: "uri" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "fullName", "role"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            fullName: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "supervisor", "student", "council_member"],
            },
            studentCode: { type: "string" },
            classId: { type: "integer" },
            majorId: { type: "integer" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" },
                refreshToken: { type: "string" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "Authentication endpoints" },
      { name: "Users", description: "User management" },
      { name: "Students", description: "Student management" },
      { name: "Supervisors", description: "Supervisor management" },
      { name: "Topics", description: "Topic management" },
      { name: "Companies", description: "Company management" },
      { name: "Internships", description: "Internship registration" },
      { name: "Progress Reports", description: "Progress report management" },
      { name: "Defense", description: "Defense session management" },
      { name: "Grading", description: "Grading and rubrics" },
      { name: "Resources", description: "Educational resources" },
      { name: "Conversations", description: "Q&A conversations" },
      { name: "Notifications", description: "User notifications" },
      { name: "Admin", description: "Admin dashboard" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
