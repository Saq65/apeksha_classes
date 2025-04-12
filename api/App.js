// app.js or Server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userroutes from "./routes/UserRoutes.js";
import inquiryRoutes from "./routes/InquiryRoutes.js";
import errorHandleMiddleware from "../api/middleware/error.js";

const app = express();

// ✅ CORRECT CORS MIDDLEWARE PLACEMENT
app.use(cors({
  origin: ["http://localhost:3000", "https://apeksha-classes-orai.netlify.app"],
  credentials: true,
}));

// ✅ Middlewares before routes
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// ✅ Routes
app.use("/api/v1", userroutes);
app.use("/api/v1", inquiryRoutes);

// ✅ Error handler
app.use(errorHandleMiddleware);

export default app;
