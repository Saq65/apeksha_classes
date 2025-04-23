import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userroutes from './routes/UserRoutes.js';
import inquiryRoutes from './routes/InquiryRoutes.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: [
   
    "http://localhost:3000",
    "https://apekshaclasses452.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"]
}));

app.use(express.json());

app.use("/api/v1", inquiryRoutes);
app.use("/api/v1", userroutes);





export default app;
