import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import userroutes from "./routes/UserRoutes.js";
import inquiryRoutes from "./routes/InquiryRoutes.js";
import errorHandleMiddleware from "../api/middleware/error.js";

const app = express();
const server = http.createServer(app); 


// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://apeksha-classes-orai.netlify.app",
  ],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/v1", userroutes);
app.use("/api/v1", inquiryRoutes);



// ✅ Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://apeksha-classes-orai.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io); // Pass io to controllers

io.on("connection", (socket) => {
  console.log("🧩 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Error middleware
app.use(errorHandleMiddleware);

export { server }; 

export default app;
