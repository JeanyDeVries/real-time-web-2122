const express = require('express')
const app = express()
const { engine } =  require('express-handlebars');
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = process.env.PORT || 4242
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

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
app.get("/chat", (req, res)=>{

   getAnimalData().then( randomAnimal => {
    res.render('chat',{
      animal: randomAnimal
    })
  });
})


io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('joinRoom', username =>{
    const user = userJoin(socket.id, username);
    //users.push(socket.id);

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

  socket.on("stop", (coord) => {
    io.emit("stop", coord);
  });

  socket.on("move", (coord) => {
    io.emit("move", coord);
  });

  socket.on("newRound", () => {
    // nieuwe speler aanwijzen (random speler uit array)
    console.log(users);
    if(users.length >= 2){
      activePlayer = users[Math.floor(Math.random() * users.length)].id;
      console.log(activePlayer)
    
      io.emit("activePlayer", activePlayer);
      console.log("De actieve speler is: ", activePlayer);
    }

    // nieuw random woord kiezen

    // woord emitten naar alle gebruikers
    io.emit("newWord", randomAnimal);

    // Client-side het woord alleen tonen bij de actieve gebruiker.. (magTekenen..)
  });

  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id);
    users.splice(users.indexOf(socket.id), 1); // 2nd parameter means remove one item only
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

async function getAnimalData(){
  let data = await supabase
    .from('Animals')
    .select()

  let randomNumber = Math.floor(Math.random() * data.data.length);
  let randomAnimal = data.data[randomNumber].Name;

  return randomAnimal;
}