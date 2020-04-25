const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words"); // This pkg helps in filtering bad words in your messages.
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages"); //Functions that handle data to be displayed
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users"); //Functions that handle User List in a Room

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app); // create Server is done explicitly as the instance is used by socket.io to create an instance
const io = socketio(server); // socket.io instance

const publicPathDir = path.join(__dirname, "../public");

app.use(express.static(publicPathDir));

// Socket listening for new connection and respective functionalities
io.on("connection", (socket) => {
  console.log("New WebSocket Connection");

  //Check for new Users joining chat
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room }); //Add new User to Chat Room
    if (error) {
      return callback(error); //Handle Addition Error
    }
    socket.join(user.room); // Join a the required room.
    socket.emit("WelcomeMessage", generateMessage("Admin", "Welcome!")); // Welcome Message
    //Broadcast message to all users in the same room notifying new user.
    socket.broadcast
      .to(user.room)
      .emit(
        "Message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    //Get new list of users in a room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });
  //Chat Message handle function
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id); //Get user details
    const filter = new Filter(); //Filter Bad Words
    if (filter.isProfane(msg)) return callback("Profanity is not Allowed!");
    io.to(user.room).emit("Message", generateMessage(user.username, msg)); //Show message to respective room
    callback();
  });
  //Disconnect User from Room
  socket.on("disconnect", () => {
    const user = removeUser(socket.id); //Remove User from Room User List
    if (user) {
      //Room Message about User Disconnection
      io.to(user.room).emit(
        "Message",
        generateMessage("Admin", `${user.username} has Disconnected!`)
      );
      // Update Room User List Display
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
  //Send Location Functionality
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id); //Get User
    //Display Location to Respective room
    io.to(user.room).emit(
      "location",
      generateLocationMessage(
        user.username,
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
