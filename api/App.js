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
  origin: ["https://apekshaclasses452.netlify.app", "http://localhost:3000"],
  credentials: true,
  allowedHeaders: ['Content-Type'],

}));
app.use(express.json());

app.use("/api/v1", inquiryRoutes);
app.use("/api/v1", userroutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://apeksha-classes-orai.netlify.app'],
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
