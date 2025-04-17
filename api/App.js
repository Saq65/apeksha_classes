import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userroutes from './routes/UserRoutes.js';
import inquiryRoutes from './routes/InquiryRoutes.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://apeksha-classes-orai.netlify.app", "http://localhost:3000"],
  credentials: true,
  allowedHeaders: ['Content-Type'],

}));
app.use(express.json());

app.use("/api/v1", inquiryRoutes);
app.use("/api/v1", userroutes);

// ✅ Create server & socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://apeksha-classes.onrender.com', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});


export default app;
