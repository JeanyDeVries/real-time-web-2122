let socket = io()
let messages = document.querySelector('.chatroom ul')
let input = document.querySelector('input')

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value) {
    socket.emit('message', input.value)
    input.value = ''
  }
})

socket.on('message', message => {
  messages.appendChild(Object.assign(document.createElement('li'), {
    textContent: message
  }))
  messages.scrollTop = messages.scrollHeight
})

document.querySelector('.plsChat').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'block')
})

document.querySelector('.chatroom button').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'none')
})