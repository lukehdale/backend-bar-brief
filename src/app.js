const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const barRoutes = require("./routes/bar");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const commentsRoutes = require("./routes/comments");
const tagsRoutes = require("./routes/tags");

require("dotenv").config();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/bars", barRoutes);
app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(commentsRoutes);
app.use(tagsRoutes);

const Bar = require("./models/Bar");

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("new-comment", async ({ barId, author, content }, callback) => {
    try {
      const bar = await Bar.findOne({ place_id: barId });
      if (!bar) return callback({ error: "Bar not found." });

      const newComment = { author, content };
      bar.comments.push(newComment);
      await bar.save();

      io.emit("comment-added", { barId, comment: newComment });
      callback({ success: true });
    } catch (error) {
      console.error("Error adding comment:", error);
      callback({ error: "Failed to add comment." });
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
