document.querySelector('.plsChat').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'block')
})

document.querySelector('.chatroom button').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'none')
})