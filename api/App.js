import express from "express";
import errorHandleMiddleware from "../api/middleware/error.js"
import cookieParser from "cookie-parser";
import userroutes from "./routes/UserRoutes.js";
import cors from "cors";


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors({ origin: '*' })); // Allow all origins, adjust if needed
app.use(express.json({ limit: '10mb' }));  // Use

// Route
app.use('/api/v1', userroutes);

app.use(errorHandleMiddleware)

export default app;