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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://apekshaclasses452.netlify.app", "http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log(" Socket disconnected:", socket.id);
  });
});


export default app;
