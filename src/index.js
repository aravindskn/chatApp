const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

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
  socket.emit("WelcomeMessage", generateMessage("Welcome!"));
  socket.broadcast.emit("Message", generateMessage("A New User has Joined!"));
  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) return callback("Profanity is not Allowed!");
    io.emit("Message", generateMessage(msg));
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("Message", generateMessage("A User has Disconnected!"));
  });
  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "location",
      generateLocationMessage(
        "https://google.com/maps?q=" +
          location.latitude +
          "," +
          location.longitude
      )
    );
    callback();
  });
});

server.listen(PORT, () => console.log("Server running on PORT:", PORT));
