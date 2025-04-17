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
  origin: "*",
  credentials: true
}));
app.use(express.json());

app.use("/api/v1", inquiryRoutes);
app.use("/api/v1", userroutes);

// ✅ Create server & socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://apeksha-classes-orai.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Make io available in route handlers
app.set("io", io);

// ✅ Log socket connections
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});


export default app;
