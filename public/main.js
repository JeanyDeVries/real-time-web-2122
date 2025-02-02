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
    socket.emit('chatMessage', input.value) //If there is input emit the input to the sockets
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
var canvas = document.querySelector(".drawingCanvas");
var controls = document.querySelector(".controls");
var answer = document.querySelector(".answer");
var context = canvas.getContext("2d");
var lastEvent;
var mayDraw = false;
var drawingColor;
var drawingThickness;
var answerText;

let x = 0, y = 0;
let isMouseDown = false;

//When clicking on control list items
$(".controls").on("click", "li", function () {
  //deselect sibling elements
  $(this).siblings().removeClass("selected");
  //select clicked element
  $(this).addClass("selected");
  //cache current color here
  drawingColor = $(this).css("background-color");
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
  drawingThickness = $("#thickness").val();
});
//round brush strokes
context.lineCap = "round";


socket.on("activePlayer", (playerId) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (socket.id == playerId) { //if you are the player
    mayDraw = true;
    // Show the drawing options and answer
    controls.classList.remove("hidden")
    answer.classList.remove("hidden")
    answer.innerHTML = answerText

    // Add the option to draw
    canvas.addEventListener("mousedown", startDrawing, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 1), false);
    canvas.addEventListener("mouseup", stopDrawing, false);
    canvas.addEventListener("mouseout", stopDrawing, false);
    console.log("Jij bent de actieve speler");
  } else {
    mayDraw = false;
    // Remove the option to draw
    canvas.removeEventListener("mousedown", startDrawing, false);
    canvas.removeEventListener("mousemove", throttle(onMouseMove, 1), false);
    canvas.removeEventListener("mouseup", stopDrawing, false);
    canvas.removeEventListener("mouseout", stopDrawing, false);    
    
    // Hide the drawing options and answer
    if(controls.classList.contains("hidden"))
      return; 
    controls.classList.add("hidden")
    answer.classList.add("hidden")
  }

});

socket.on("answer", (answer) =>{
  answerText = answer;
})

const startDrawing = (event) => {
  socket.emit("start", [event.offsetX, event.offsetY]); // Send the coordinates to all the sockets where to start drawing
};

socket.on("start", (coord) => {
  isMouseDown = true;
  [x, y] = coord;
});


const stopDrawing = (e) => {  
  socket.emit("stop", [e.offsetX, e.offsetY]); // Send the coordinates to all the sockets where to stop drawing
};

socket.on('stop', (coord)=>{
  if (!isMouseDown) return;
  isMouseDown = false;
})


const onMouseMove = (e) => {
  var draw = {coord: [e.offsetX, e.offsetY], drawingColor, drawingThickness} 
 
  socket.emit("move", draw); // Send the info that you need to draw the line to all sockets
};

socket.on('move', (draw)=>{
  if (!isMouseDown) return;
  drawLine(draw.coord , draw.drawingColor, draw.drawingThickness);
})

//  Start met tekenen

const drawLine = (event, color, thickness) => {

  if (isMouseDown) {
    const newX = event[0];
    const newY = event[1];

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(newX, newY);
    context.lineWidth = thickness;
    context.stroke();
    context.strokeStyle = color;
    x = newX;
    y = newY;

    socket.emit("drawing", { //Send the drawing to all the users with sockets
      x: newX,
      y: newY,
      stroke: color,
      color: thickness,
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