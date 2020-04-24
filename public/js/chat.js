const socket = io();
const form = document.querySelector("#chat-form");
const locationButton = document.querySelector("#locationButton");
const msgInput = document.querySelector("#msgInput");
const msgButton = document.querySelector("#msgButton");
const messages = document.querySelector("#messages");
const $location = document.querySelector("#location");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

socket.on("WelcomeMessage", (msg) => {
  console.log(msg);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    msgButton.removeAttribute("disabled");
    msgInput.value = "";
    msgInput.focus();
    if (error) return console.log(error);
    console.log("Message Delivered");
  });
});

socket.on("Message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    message: msg,
  });
  messages.insertAdjacentHTML("beforeend", html);
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
        console.log("Location Shared!");
        locationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.on("location", (location) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    location,
  });
  $location.insertAdjacentHTML("beforeend", html);
});
