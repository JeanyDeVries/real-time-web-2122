const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = process.env.PORT || 4242

const { createClient } =  require('@supabase/supabase-js');
const supabaseUrl = 'https://cpytdjbqlpwemxucrspz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNweXRkamJxbHB3ZW14dWNyc3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTE0ODM0ODIsImV4cCI6MTk2NzA1OTQ4Mn0.gURZllOQlDhs50kn0xoE2L29dlyDRvCekpBFVVhUPg4'
const supabase = createClient(supabaseUrl, SUPABASE_KEY)

app.use(express.static(path.join(__dirname, 'public')))

app.get("/", (req, res)=>{
  res.sendFile(path.join(__dirname, 'views/index.html'))
})

app.get("/chat", (req, res)=>{
  res.sendFile(path.join(__dirname, 'views/chat.html'))
})


io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('joinRoom', username =>{
    const user = userJoin(socket.id, username);

    socket.join(user.room);

    //add room functionality (https://www.npm youtube.com/watch?v=jD7FnbI76Hg&ab_channel=TraversyMedia)

    socket.emit('message', formatMessages("BOT", `${user.username.username} has joined the room`))

  })

  socket.on('chatMessage', message =>{
    const user = getCurrentUser(socket.id);
    io.emit('message', formatMessages(user.username.username ,message))
  })

  socket.on("drawing", (draw) => {
    io.emit("drawing", draw);
  });

  socket.on("start", (coord) => {
    io.emit("start", coord);
  });

  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id);
    io.emit('message', formatMessages("BOT", `${user.username.username} has left the room`))  
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