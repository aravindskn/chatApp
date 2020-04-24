const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPathDir = path.join(__dirname, "../public");

app.use(express.static(publicPathDir));

app.get("", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("New WebSocket Connection");
  socket.emit("WelcomeMessage", "Welcome!");
  socket.on("sendMessage", (msg) => {
    io.emit("sendMessage", msg);
  });
});

server.listen(PORT, () => console.log("Server running on PORT:", PORT));
