// This script stores and does all the functionalities for Users using the application
const users = [];

//Add a new User
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) return { error: "Username and Room are Required!" };

  const existingUser = users.find((user) => {
    //Check for duplicate
    return user.room === room && user.username === username;
  });

  if (existingUser) return { error: "Username is in Use!" };

  const user = { id, username, room };
  users.push(user); //Push to List
  return { user };
};
//Remove User
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id); //Find User

  if (index !== -1) return users.splice(index, 1)[0]; //Remove from List
};
//Get User Info
const getUser = (id) => {
  const user = users.find((user) => user.id === id); // Find User

  if (user) return user;
};
//Get all Users in a Specific Room
const getUsersInRoom = (room) => {
  const usersInRoom = users.map((user) => {
    if (user.room === room) return user; //Filter User By Rooms
  });
  if (usersInRoom.length > 0) return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
