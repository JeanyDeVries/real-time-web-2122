const socket = io()
const messages = document.getElementById('chatMessages')
const input = document.querySelector('input')

const username = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('joinRoom', username)

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value) {
    socket.emit('chatMessage', input.value)
    input.value = ''
  }
})

socket.on('message', message => {
  var li = messages.appendChild(Object.assign(document.createElement('li')))
  li.appendChild(Object.assign(document.createElement('p'), { innerHTML: message.username + ": "}))
  li.appendChild(Object.assign(document.createElement('p'), { innerHTML: message.text }))
  messages.scrollTop = messages.scrollHeight
})
