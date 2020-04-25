//This script handles messages to and from server to client
const generateMessage = (username, text) => {
  //Chat Message
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (username, url) => {
  //Location Message
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMessage, generateLocationMessage };
