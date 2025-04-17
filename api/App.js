import express from "express";
import http from "http";
import { Server } from "socket.io";  // Correctly import 'Server' from socket.io
import errorHandleMiddleware from "../api/middleware/error.js";
import cookieParser from "cookie-parser";
import userroutes from "./routes/UserRoutes.js";
import cors from "cors";
import inquiryRoutes from "./routes/InquiryRoutes.js";

const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = new Server(server);  // Create an instance of Server using the http server

// Set up the socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://apeksha-classes-orai.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","OPTIONS"]
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1', userroutes);
app.use("/api/v1", inquiryRoutes);

// Error handler
app.use(errorHandleMiddleware);

// Start the server
server.listen(8000, () => {
  console.log("Server running on port 8000");
});

export default app;
