//This File Handles all Client Side functionality for the Chat
const socket = io();

//Fetching all html action elements by ID
const form = document.querySelector("#chat-form");
const locationButton = document.querySelector("#locationButton");
const msgInput = document.querySelector("#msgInput");
const msgButton = document.querySelector("#msgButton");
const messages = document.querySelector("#messages");
const $location = document.querySelector("#location");
const sidebarDiv = document.querySelector("#sidebar");

//Fetching all Mustache html Scripts by ID
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Get room and username from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//Welcome Message
socket.on("WelcomeMessage", (msg) => {
  console.log(msg);
});

//Autoscroll Chats when no of Messages are more than screen size
const autoscroll = () => {
  //new Message Element
  const newMessage = messages.lastElementChild;
  //Height of the new Message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
  //Visible height
  const visibleHeight = messages.offsetHeight;
  //Height of one message container
  const containerHeight = messages.scrollHeight;
  //How much have we scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

//Form Submit handler
form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgButton.setAttribute("disabled", "disabled"); //Disable Send Button till message is displayed on screen
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    //Send Data to Server
    msgButton.removeAttribute("disabled");
    msgInput.value = "";
    msgInput.focus();
    if (error) return console.log(error);
  });
});

//Receive Message from Server
socket.on("Message", (msg) => {
  //Display Message on UI using Mustache templating
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html); //Add every new message at the end of the message list
  autoscroll();
});

//Location Submit Handler
locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not Supported by your Browser!");
  locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    // Get Location using Broswer Location helper
    socket.emit(
      // Send Location to Server
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        locationButton.removeAttribute("disabled");
      }
    );
  });
});

//Receive Location Data from Server
socket.on("location", (location) => {
  //Display location using Mustache
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("hh:mm a"),
  });
  $location.insertAdjacentHTML("beforeend", html); //Add every new message at the end of the message list
  autoscroll();
});

//Fetch Room User List from Server
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebarDiv.innerHTML = html;
});

//Join a Room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
