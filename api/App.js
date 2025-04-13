import express from "express";
import errorHandleMiddleware from "../api/middleware/error.js";
import cookieParser from "cookie-parser";
import userroutes from "./routes/UserRoutes.js";
import cors from "cors";
import inquiryRoutes from "./routes/InquiryRoutes.js";

const app = express();

// app.use(cors({
//    origin: 'http://localhost:3000',  
//    credentials: true,                
// }));

app.use(cors({
  origin: [
   
    "http://localhost:3000",
    "https://apeksha-classes-orai.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"]
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
