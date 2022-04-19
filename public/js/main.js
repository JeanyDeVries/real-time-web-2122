//Register/update the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(function (registration) {
        return registration.update();
      })
  });
}

document.querySelector('.plsChat').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'block')
})

document.querySelector('.chatroom button').addEventListener('click', () => {
  document.querySelector('.chatroom').style.setProperty('display', 'none')
})