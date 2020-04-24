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
  socket.broadcast.emit("Message", "A New User has Joined!");
  socket.on("sendMessage", (msg) => {
    io.emit("Message", msg);
  });
  socket.on("disconnect", () => {
    io.emit("Message", "A User has Disconnected!");
  });
  socket.on("sendLocation", (location) => {
    io.emit(
      "location",
      "https://google.com/maps?q=" +
        location.latitude +
        "," +
        location.longitude
    );
  });
});

server.listen(PORT, () => console.log("Server running on PORT:", PORT));
