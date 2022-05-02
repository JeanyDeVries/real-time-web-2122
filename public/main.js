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
var context = canvas.getContext("2d");
var lastEvent;


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

// Stap 1, begin met tekenen
const startDrawing = (event) => {
  socket.emit("start", [event.offsetX, event.offsetY]);
};

socket.on("start", (coord) => {
  console.log("Start drawing from: ", coord);
  isMouseDown = true;
  [x, y] = coord;
});

// Stap 2, stop met tekenen

const stopDrawing = (e) => {
  if (!isMouseDown) return;
  isMouseDown = false;
  drawLine(e);
};

// Stap 3, teken een lijn als de muis beweegt

const onMouseMove = (e) => {
  if (!isMouseDown) return;
  drawLine(e);
};

//  Start met tekenen

const drawLine = (event) => {
  if (isMouseDown) {
    const newX = event.offsetX;
    const newY = event.offsetY;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(newX, newY);
    context.stroke();
    context.strokeStyle = color;
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

canvas.addEventListener("mousedown", startDrawing, false);
canvas.addEventListener("mousemove", throttle(onMouseMove, 1), false);
canvas.addEventListener("mouseup", stopDrawing, false);
canvas.addEventListener("mouseout", stopDrawing, false);

function drawEvent(draw) {
  // console.log(draw);
  // context.drawLine()
  const { x, y, color, stroke } = draw;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y);
  context.strokeStyle = color;
  context.lineWidth = stroke;
  context.stroke();
  context.closePath();
}