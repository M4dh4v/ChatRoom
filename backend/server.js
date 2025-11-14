import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import encrypt from "./encrypt.js";
import fs from "fs";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Store messages per room
const roomMessages = {}; // { roomName: [ { author, message, time } ] }

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // your frontend URL in production
    methods: ["GET", "POST"],
  },
  pingInterval: 25000, // send ping every 25s
  pingTimeout: 180000, // 3 minutes timeout before disconnect
});

io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // User joins a room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`📥 User ${socket.id} joined room: ${room}`);

    if (roomMessages[room]) {
      socket.emit("message_history", roomMessages[room]);
    } else {
      roomMessages[room] = [];
    }
  });

  // When a user sends a message
  socket.on("send_message", (data) => {
    const { room } = data;

    if (!roomMessages[room]) roomMessages[room] = [];
    roomMessages[room].push(data);

    // Keep only last 100 messages
    if (roomMessages[room].length > 100) {
      roomMessages[room].shift();
    }

    io.to(room).emit("receive_message", data);
  });

  // Heartbeat from client to keep connection alive
  socket.on("heartbeat", (data) => {
    // Optionally log if needed:
    // console.log(`💓 Heartbeat from ${data.user}`);
  });

  // When a user disconnects
  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Chatroom server is running 🚀");
});

// Login route
app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

    if (!data[user]) {
      return res.json({
        success: false,
        message: "User not found.",
      });
    }

    if (data[user] !== encrypt(password)) {
      return res.json({
        success: false,
        message: "Incorrect password.",
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error reading data.json",
    });
  }
});

// Register route
app.post("/register", async (req, res) => {
  try {
    const { user, password } = req.body;
    const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

    if (data[user]) {
      return res.json({
        success: false,
        message: "User already exists.",
      });
    }

    const encryptedPassword = encrypt(password);
    data[user] = encryptedPassword;
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8");

    res.json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Error registering user.",
    });
  }
});

// Update route
app.post("/update", async (req, res) => {
  try {
    const { user, password } = req.body;
    const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
    const encryptedPassword = encrypt(password);
    data[user] = encryptedPassword;
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf-8");

    res.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Error updating user.",
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
