# Rawr.io

## Table of Contents
- [Description](#description)
- [Clone](#clone)
- [Sockets](#sockets)
- [API](#api)
- [Data flow diagram](#dfd)
- [Issues](#Issues)

## Description
This is a real time web where you as a user can draw or guess pictures, depending on whose turn it is. One player draws the animal which is on the upper left corner. The other sees what the other is drawing and has to guess which animal it is in the chat. 

![image](https://user-images.githubusercontent.com/44086608/167628298-ffc0a462-4f40-4f7d-8fbe-66c7d9318c94.png)


## Clone <a name="clone">
```
  $ git clone https://github.com/JeanyDeVries/real-time-web-2122.git
```

## Sockets <a name="sockets">
To make the app a realtime app, I used sockets. Sockets are ideal for retrieving and sending data between the users who are connected. This way when I draw on the canvas I can also draw it using sockets. That way the other users can see it as well. 
  
As you can see in the code below I have the logic of the sockets of the drawing. I locally have the onMouseMove logic. I then make a object full of the information we need for the drawing. I then have a socket "move" and give the data of the draw with it. I then call the socket where I draw the lines on the canvas. With the information of the draw object we can now use that data to draw. I do this locally and with the socket "drawing" do it on the server. 
  
  ```
  
  const onMouseMove = (e) => {
    var draw = {coord: [e.offsetX, e.offsetY], drawingColor, drawingThickness}

    socket.emit("move", draw);
  };

  socket.on('move', (draw)=>{
    if (!isMouseDown) return;
    drawLine(draw.coord , draw.drawingColor, draw.drawingThickness);
  })
  
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

    socket.emit("drawing", {
      x: newX,
      y: newY,
      stroke: color,
      color: thickness,
    });
  }
};
  
socket.on("drawing", drawEvent); //drawEvent is just like the drawline, but without the emit.

  
  ```
  
This is just one example of the sockets I use in the project. 
  
  
## API <a name="api">
I want the users to guess animals that are being drawn. But to do so we need a database of multiple sorts of animals. I want to fetch the data from this API. Sadly I couldn't find a API which was perfect for my project. So I made my own API with writing a database in https://app.supabase.io/. 
To make it work in my code, I fetched and selected the data I wanted. I locally save the data in an array. I then select a random element from the data. 

  
```
    if(!animals){
    let data = await supabase
    .from('Animals')
    .select()
    animals = data;
  }


  let randomNumber = Math.floor(Math.random() * animals.data.length);
  randomAnimal = animals.data[randomNumber].Name;
  
```
  
But this all happens locally. So how do I send the answer/random animal to the other users? SOCKETS! I did it super simple. I made a socket emit where I send the answer to the socket on with the same name. I then have the answer to all the users. This variable is used to show the answer and check if it is correct.
  
```
  
    //in app.js
    getAnimalData().then( data => {
      randomAnimal = data;
      io.emit("answer", randomAnimal);
    });
  
    //in main.js
    socket.on("answer", (answer) =>{
      answerText = answer;
    })
  
```


## Data flow diagram <a name="dfd">

  
## Issues <a name="Issues">
If you see any issues in my code or spots that need improvements let me know. You can file an issue in this repository. Thank you!
