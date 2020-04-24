const socket = io();
const form = document.querySelector("#chat-form");

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
