const socket = io();
const form = document.querySelector("#chat-form");
const locationButton = document.querySelector("#location");

socket.on("WelcomeMessage", (msg) => {
  console.log(msg);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg);
});

socket.on("Message", (msg) => {
  console.log(msg);
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not Supported by your Browser!");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
});

socket.on("location", (location) => {
  console.log(location);
});
