# Server side Rijksmuseum

## Table of Contents
- [Description](#description)
- [Install Project](#Install)
- [Server setup](#Server)
- [Server-worker](#Server-worker)
- [Activity Diagram](#description)
- [Optimization](#Diagram)
- [Tooling](#Tooling)
- [Issues](#Issues)

## Description
To improve the single web page we have made for Rijksmuseum I build a server side application. It was a client side at first, but this comes with some counterpoints. The loading of the page takes some time plus if you have any javascript errors it can be fatal. This will be countered in server side rendering. I explained this in this readme on how I made it work. 

## Install Project <a name="Install">
### Clone this repo
```
  $ git clone https://github.com/AronPelgrim/web-app-from-scratch-2122.git
```

### Navigate to the repo
```
$ cd web-app-from-scratch-2122
```
  
When you have cloned the repo, it will not work yet. We need to install some packages:
  1. Install node.js
  2. Write in the terminal npm install express
  3. Also install dotenv, nodefetch, nodemon and ejs this way.
  4. To start the server, write in the terminal npm start.
  
  
## Server setup <a name="Server">
To begin the trandformation from client side to server side, I first needed to install some packages. The first thing needed was Node.js, thankfully I used this before so I already had it installed. Secondly I needed express.js and ejs. I installed it using the npm package manager via the terminal. The packagemanager then looks like this:
  
  ```
    "name": "myapp",
    "version": "1.0.0",
    "description": "server side app",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "start": "nodemon app.js"
    },
    "author": "Jeany de Vries",
    "license": "ISC",
    "dependencies": {
      "ejs": "^3.1.6",
      "express": "^4.17.3"
    },
    "devDependencies": {
      "nodemon": "^2.0.15"
    }
  ```
  
  (I installed nodemon as well just so it refreshes the page automatically)
  
The second thing to do was setting the server up with the packages we have downloaded. A mistake I made was only using node.js for setting up the server. I realised  that I could set up my html very fast, but the css was a bit of a problem. I then asked for help and they said I needed to use express as well. This eventually made things a lot easier. But how did I get it to work? Well I first set up an app with the express method and made it listen to the port I wanted (you also need to import express using the require method). I then wanted to render the index.html. But after some searching I needed to translate the html to ejs. This made the use of the data a lot easier, because javascript can be added to the html elements. To find the ejs file I set the ejs to views with a pathname where it could find it. For the other files I said to find it in the public folder, where I transferred my files in. This is the code below:
  
  
  ```
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

  app.listen(port);
  ```
  
  
The server now fetches the data when the hashtag is emty, which in this case is my home page. Then I use the response to retrieve my data and render that variable in my ejs. I did this for all my pages. A nice thing with fetching the with the app, is that it can read an id in the hashtag url using :id. This made the detail page easier cause I could just grab the id from the request parameters, instead of having to give the id through javascript as I did before.
  
```
  app.get('/painting/:id', (req, res) => {
      fetch(`https://www.rijksmuseum.nl/api/nl/collection/${req.params.id}?key=${api_key}&imgonly=true`)
```
   
## Server-worker <a name="Server-worker">
Now that everything was running on the server, it needed a sort of backup. What if the page went offline. The user still needs to have some visuals or have some pages in a storage. That's where the service worker is for. 

To add the service worker to our project I made a main.js script. It checks if it is supported, if so register the service worker on load. Then check if it has any differences, so yes update the service worker. Now when I refresh the page, the service worker is added. But it is empty so we need to add some code to it!

```
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/serviceWorker.js')
      .then(function(registration) {
        return registration.update();
        })
      });
   }
```
  
A service worker has multiple functions, like install, fetch etc. 
We first needed the function "install" to install the service worker and precache our main elements of our site. 
When we are installing the service worker we also want to add the assets to it in the cache storage. I made an array with the essentails I wanted. It then adds it all to the cache during the install, see code below. 
  
```
  const CORE_CACHE_VERSION = 'v8'
  const CORE_ASSETS = [
    '/js/main.js',
    '/css/stylesheet.css',
    `/offline`
  ];

  //precaching
  self.addEventListener('install', event => {
      event.waitUntil(
      caches.open(CORE_CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()))
   });
```
  
Now our offline page is running with our css, but we also want to see the pages. This is where the fetch function comes in.
  
On our site we fetch for every new site we go to, because we load new data. This can take a while and is bad for our performance plus it will not work if we are offline. 
  
In the fetch listener of our service worker we simply check if is one of our core elements or an html page. If it is an html page we open up a new cache called html-cache where I store all the loaded html pages. Then if the page is not yet in the cache we add the newly loaded page to it. And if for some reason you are offline and you check a site that is not in the cache yet, you will go to the offline page. 
  
```
  self.addEventListener('fetch', event => {
    if (isCoreGetRequest(event.request)) 
    {
        console.log('Core get request: ', event.request.url);
        // cache only strategy
        event.respondWith(
        caches.open(CORE_CACHE_VERSION)
        .then(cache => cache.match(event.request.url)))
    } 
    else if (isHtmlGetRequest(event.request)) 
    {
        // generic fallback
        event.respondWith(
            caches.open('html-cache')
            .then(cache => cache.match(event.request.url))
            .then(response => response ? response : fetchAndCache(event.request, 'html-cache'))
            .catch(e => {
                return caches.open(CORE_CACHE_VERSION)
                .then(cache => cache.match('/offline'))
            }))
    }
```
  
## Activity Diagram <a name="Diagram">
![image](https://user-images.githubusercontent.com/44086608/161763795-fad8a552-2ed7-41df-990d-c171a5fe73ca.png)
  
## Optimilization  <a name="Optimization">
Now that everything is working, we need to optimize. We want the user to have a nice experience with our site. We don't want our users waiting for our site to load. To do that I made some optimilizatations:
1. I used the compression package to compress some images, so they will load faster.
    ```app.use(compression())```
2. I wanted the javascript to load after all the html elements were loaded, so that the user saw all the visuals from the site. I did that by writing defer after the       script. ```<script type="module" src="/js/main.js" defer></script>```
3. The third thing I did was removing some items from the cache storage. I didn't want to overflow the cache storage with old html caches. So I set a limit to 40 and if it went over the limit it will delete the last item. Sadly new items are being added on the last index, and the last index will be deleted when it overflows the cache. I need to reorder the cache storage if I want to make it work more perfectly. 

After all the optimizing, this was the result: 
  
![image](https://user-images.githubusercontent.com/44086608/161755517-13b1e658-d32b-45d9-b2ce-7918fef2421d.png)


## Tooling <a name="Tooling">
I set up tooling for nodemon in my packages.json. I wanted to start the project with nodemon. So in my script I said in the start, nodemon app.js. This way when I type npm start in my terminal I start the script app.js using nodemon. 
  
```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node app.js",
    "dev": "npx nodemon app.js"
  }
```
  
## Issues <a name="Issues">
If you see any issues in my code or spots that need improvements let me know. You can file an issue in this repository. Thank you!
