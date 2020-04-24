const socket = io();
const form = document.querySelector("#chat-form");
const locationButton = document.querySelector("#locationButton");
const msgInput = document.querySelector("#msgInput");
const msgButton = document.querySelector("#msgButton");
const messages = document.querySelector("#messages");
const $location = document.querySelector("#location");
const sidebarDiv = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("WelcomeMessage", (msg) => {
  console.log(msg);
});

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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    msgButton.removeAttribute("disabled");
    msgInput.value = "";
    msgInput.focus();
    if (error) return console.log(error);
  });
});

socket.on("Message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not Supported by your Browser!");
  locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
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

socket.on("location", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("hh:mm a"),
  });
  $location.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebarDiv.innerHTML = html;
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
