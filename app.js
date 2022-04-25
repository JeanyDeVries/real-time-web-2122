const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(server)
const port = process.env.PORT || 4242
const formatMessage = require("./public/messages")

app.use(express.static(path.resolve('public')))

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('joinRoom', username =>{

    socket.on('message', (message) => {
      io.emit('message', formatMessage(username, message))
    })

  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(port, () => {
  console.log('listening on port ', port)
})