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

// ✅ Attach io instance to app so it can be accessed in controllers
app.set("io", io);

// Optional: log socket connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

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

// Error middleware
app.use(errorHandleMiddleware);

export { server }; 

export default app;
