
import express from "express";
import errorHandleMiddleware from "../api/middleware/error.js";
import cookieParser from "cookie-parser";
import userroutes from "./routes/UserRoutes.js";
import cors from "cors";
import inquiryRoutes from "./routes/InquiryRoutes.js";
import http from "http"; // For creating the server
import { Server } from "socket.io"; 

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://apeksha-classes-orai.netlify.app"
    ],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

global.io = io;

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
});
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1', userroutes);
app.use("/api/v1", inquiryRoutes);

app.use(errorHandleMiddleware);

export default app;

// ✅ Export io to be used in other files
export { io };

// ✅ Run the server
server.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
