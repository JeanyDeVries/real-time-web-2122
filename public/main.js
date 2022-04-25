let socket = io()
let messages = document.getElementById('chatMessages')
let input = document.querySelector('input')

const username = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

console.log(username)

socket.emit('joinRoom', username)

/*document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value) {
    socket.emit('message', input.value)
    input.value = ''
  }
})*/

socket.on('message', message => {
  var li = messages.appendChild(Object.assign(document.createElement('li'), { textContent: message.text }))
  li.appendChild(Object.assign(document.createElement('p'), { textContent: message.user }))
  messages.scrollTop = messages.scrollHeight
})
