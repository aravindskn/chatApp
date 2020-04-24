const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPathDir = path.join(__dirname, "../public");

app.use(express.static(publicPathDir));

io.on("connection", (socket) => {
  console.log("New WebSocket Connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("WelcomeMessage", generateMessage("Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("Message", generateMessage(`${user.username} has joined!`));
    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) return callback("Profanity is not Allowed!");
    io.emit("Message", generateMessage(msg));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "Message",
        generateMessage(`${user.username} has Disconnected!`)
      );
    }
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
