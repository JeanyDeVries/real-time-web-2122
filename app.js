const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = process.env.PORT || 4242

app.use(express.static(path.resolve('public')))


io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('joinRoom', username =>{
    const user = userJoin(socket.id, username);

    socket.join(user.room);

    //add room functionality (https://www.npm youtube.com/watch?v=jD7FnbI76Hg&ab_channel=TraversyMedia)

    socket.emit('message', formatMessages("BOT", `user has joined the room`))

  })

  socket.on('chatMessage', message =>{
    const user = getCurrentUser(socket.id);
    io.emit('message', formatMessages(user.username.username, message))
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(port, () => {
  console.log('listening on port ', port)
})

function formatMessages(username, text){
  return{
      username,
      text
  }
}

const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}