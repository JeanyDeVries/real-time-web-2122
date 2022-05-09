const socket = io()
const messages = document.getElementById('chatMessages')
const input = document.querySelector('input')

const username = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('joinRoom', username)
socket.emit("newRound");

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault()
  if (input.value) {
    socket.emit('chatMessage', input.value)
    input.value = ''
  }
})

socket.on('message', message => {
  var li = messages.appendChild(Object.assign(document.createElement('li')))
  li.appendChild(Object.assign(document.createElement('p'), {
    innerHTML: message.username + ": "
  }))
  li.appendChild(Object.assign(document.createElement('p'), {
    innerHTML: message.text
  }))
  messages.scrollTop = messages.scrollHeight
})



//DRAWING
var color = $(".selected").css("background-color");
var canvas = document.querySelector(".drawingCanvas");
var controls = document.querySelector(".controls");
var answer = document.querySelector(".answer");
var context = canvas.getContext("2d");
var lastEvent;
var mayDraw = false;

let x = 0, y = 0;
let isMouseDown = false;

//When clicking on control list items
$(".controls").on("click", "li", function () {
  //deselect sibling elements
  $(this).siblings().removeClass("selected");
  //select clicked element
  $(this).addClass("selected");
  //cache current color here
  color = $(this).css("background-color");
});

//When "new color" is pressed
$("#revealColorSelect").click(function () {
  //show color select or hide select
  changeColor();
  $("#colorSelect").toggle();
});

//update color span
function changeColor() {
  var r = $("#red").val();
  var g = $("#green").val();
  var b = $("#blue").val();
}
//When color sliders change
$(".color-sliders[type=range]").change(changeColor);

//change thickness
$("#thickness").on("input", function () {
  context.lineWidth = $("#thickness").val();
});
//round brush strokes
context.lineCap = "round";

socket.on("activePlayer", (playerId) => {
  if (socket.id == playerId) {
    mayDraw = true;
    controls.classList.remove("hidden")
    answer.classList.remove("hidden")

    canvas.addEventListener("mousedown", startDrawing, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 0.1), false);
    canvas.addEventListener("mouseup", stopDrawing, false);
    canvas.addEventListener("mouseout", stopDrawing, false);
    console.log("Jij bent de actieve speler");
  } else {
    mayDraw = false;
    if(controls.classList.contains("hidden"))
      return; 

    controls.classList.add("hidden")
    answer.classList.add("hidden")
  }
});

// Stap 1, begin met tekenen
const startDrawing = (event) => {
  socket.emit("start", [event.offsetX, event.offsetY]);
};

socket.on("start", (coord) => {
  isMouseDown = true;
  [x, y] = coord;
});

// Stap 2, stop met tekenen

const stopDrawing = (e) => {  
  socket.emit("stop", [e.offsetX, e.offsetY]);
};

socket.on('stop', (coord)=>{
  if (!isMouseDown) return;
  isMouseDown = false;
  drawLine(coord);
})

// Stap 3, teken een lijn als de muis beweegt

const onMouseMove = (e) => {
  socket.emit("move", [e.offsetX, e.offsetY]);
};

socket.on('move', (coord)=>{
  if (!isMouseDown) return;
  drawLine(coord);
})

//  Start met tekenen

const drawLine = (event) => {

  if (isMouseDown) {
    const newX = event[0];
    const newY = event[1];
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(newX, newY);
      context.stroke();
      context.strokeStyle = color;
      console.log(color)
      //[x, y] = [newX, newY];
      x = newX;
      y = newY;

    socket.emit("drawing", {
      x: newX,
      y: newY,
      stroke: context.lineWidth,
      color: context.strokeStyle,
    });
  }
};

socket.on("drawing", drawEvent);

function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function () {
    var time = new Date().getTime();

    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function drawEvent(draw) {
  const { x, y, color, stroke } = draw;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y);
  context.strokeStyle = color;
  context.lineWidth = stroke;
  context.stroke();
  context.closePath();
}