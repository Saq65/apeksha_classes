import express from "express";
import errorHandleMiddleware from "../api/middleware/error.js";
import cookieParser from "cookie-parser";
import userroutes from "./routes/UserRoutes.js";
import cors from "cors";
import inquiryRoutes from "./routes/InquiryRoutes.js";

const app = express();

// CORS - Set this BEFORE routes and cookies
//app.use(cors({
    origin: 'http://localhost:3000',  
    credentials: true,                
}));

app.use(cors({
  origin: "*", // or better: ['https://your-frontend.netlify.app']
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Parse cookies and JSON
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1', userroutes);
app.use("/api/v1", inquiryRoutes);

// Error handler
app.use(errorHandleMiddleware);

export default app;
