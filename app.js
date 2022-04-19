const express = require('express');
const path = require('path');
const compression = require('compression')

const app = express();
const port = process.env.PORT || 3535;
const api_key = "ixmhN4my&"

// socket aanzetten
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const fetch = (...args) => import('node-fetch').then(({
  default: fetch
}) => fetch(...args))

//Let the app listen to ejs viewss
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'));

//Set a public path, so /public is not needed anywhere
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression())

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('message', (message) => {
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.get('/', function (req, res) {
  fetch(`https://www.rijksmuseum.nl/api/nl/collection?key=${api_key}&ps=20&imgonly=true`)
    .then(async response => {
      const artWorks = await response.json()
      res.render('index', {
        pageTitle: 'Home page',
        data: artWorks.artObjects
      })
    })
    .catch(err => res.send(err))
})

app.get('/painting/:id', (req, res) => {
  //Use the id in the request for the fetch
  fetch(`https://www.rijksmuseum.nl/api/nl/collection/${req.params.id}?key=${api_key}&imgonly=true`)
    .then(async response => {
      const detail = await response.json()
      res.render('detail', {
        pageTitle: `Kunstwerk: ${req.params.id}`,
        data: detail.artObject
      })
    })
    .catch(err => res.send(err))
})

app.get('/search', (req, res) => {
  //Use the query to get the search input
  fetch(`https://www.rijksmuseum.nl/api/nl/collection?key=${api_key}q=${req.query.query}`)
    .then(async response => {
      const search = await response.json()
      res.render('searchResults', {
        pageTitle: `Kunstwerk: ${req.query.query}`,
        data: search.artObjects
      })
    })
    .catch(err => {
      res.send(err);
    })
})

app.get('/offline', (req, res) => {
  res.render('offline', {
    pageTitle: `Offline`
  });
})


http.listen(port);