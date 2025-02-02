const express = require('express')
const app = express()
const { engine } =  require('express-handlebars');
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = process.env.PORT || 4242

const { createClient } =  require('@supabase/supabase-js');
const supabaseUrl = 'https://cpytdjbqlpwemxucrspz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNweXRkamJxbHB3ZW14dWNyc3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTE0ODM0ODIsImV4cCI6MTk2NzA1OTQ4Mn0.gURZllOQlDhs50kn0xoE2L29dlyDRvCekpBFVVhUPg4'
const supabase = createClient(supabaseUrl, SUPABASE_KEY)

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res)=>{
  res.render('index')
})

var randomAnimal;
var animals; 

app.get("/chat", (req, res)=>{

   getAnimalData().then( randomAnimal => {
    res.render('chat',{ })
  });
})


io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('joinRoom', username =>{
    const user = userJoin(socket.id, username);

    socket.join(user.room);

    io.emit('message', formatMessages("BOT", `${user.username.username} has joined the room`))

  })

  socket.on('chatMessage', message =>{
    const user = getCurrentUser(socket.id);

    var isCorrect = checkIfMessageCorrect(message, user);

    if(!isCorrect)
      io.emit('message', formatMessages(user.username.username , message))
  })

  socket.on("drawing", (draw) => {
    io.emit("drawing", draw);
  });

  socket.on("start", (coord) => {
    io.emit("start", coord);
  });

  socket.on("stop", (coord) => {
    io.emit("stop", coord);
  });

  socket.on("move", (coord) => {
    io.emit("move", coord);
  });

  socket.on("newRound", () => {
    newRound();
  });

  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id);
    users.splice(users.indexOf(socket.id), 1); // Remove the user who disconnected from the array
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

function checkIfMessageCorrect(message, user){
  if(message === randomAnimal && user.id !== activePlayer){ // If the message is correct + you are not the one who is drawing
    newRound();
    io.emit('message', formatMessages("BOT", `${user.username.username} is correct!`))
    return true;
  }

  return false;
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

async function getAnimalData(){
  if(!animals){
    let data = await supabase
    .from('Animals')
    .select()
    animals = data;
  }


  let randomNumber = Math.floor(Math.random() * animals.data.length);
  randomAnimal = animals.data[randomNumber].Name;

  return randomAnimal;
}

function newRound(){
  if(users.length >= 2){ // Only make a active player when there are more than 2 players in the room
    activePlayer = users[Math.floor(Math.random() * users.length)].id; // Make a new active player randomly

    getAnimalData().then( data => {
      randomAnimal = data;
      io.emit("answer", randomAnimal); // Give the answer to all the sockets 
      console.log(randomAnimal)
      io.emit("activePlayer", activePlayer); // Give the active player to all the sockets 
      console.log("De actieve speler is: ", activePlayer);
    });
  }
}