//Register/update the service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/serviceWorker.js')
      .then(function(registration) {
        return registration.update();
        })
      });
   }