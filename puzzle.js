
// Puzzle Game
// The topic was changed with the approval of the teacher


//declaring the necessary variables
var imageToCut = new Image();//original image
var canvas;
var context;
var pieces = [];//array of pieces
var pieceOne;//used for swapping
var pieceTwo;
var initialLeft;//initial coordinates of the dragged piece
var initialTop;
var pieceDragged = {};
var pieceOnDrop = {};//piece that is under the dragged piece
var bound, drag, offsetX, offsetY;//used for mouse and canvas coordinates
var startX, startY;
var clickIsPressed = false;
var imageOriginal; // to compare image before and after shuffle in order to see if the puzzle is completed
var imageAfterUserModifies;
var imageQuickSolve;//image for autosolve


// 1.drag and drop image to begin puzzle

$(function () {
     $(document)
        .on('dragover', function (e) {
            e.preventDefault();
        })
        .on('drop', function (e) {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;

            if (files.length > 0) {

                var reader = new FileReader();

                reader.onload = function (e) {
                    $("<img></img>")
                            .load(function(){drawFullImage(this);})
                            .attr("src", e.target.result);
                };
                reader.readAsDataURL(files[0]);
            }
        });
});

function drawFullImage(image) {

    var canvH = image.height, canvW = image.width;

    $("#puzzleImage")
        .attr({ width: canvW, height: canvH });

    context = $("#puzzleImage")[0].getContext("2d");
    context.drawImage(image,0,0);

    canvas = document.getElementById("puzzleImage");

    document.getElementById("p").innerHTML = "Click button to begin";

    imageToCut.src = canvas.toDataURL();
}

// 2. splitting the image in puzzle pieces and shuffling

function splitImage(){

  if(imageToCut == null || canvas == null){
    alert("Drag and drop an image to begin");
    $("#startBtn").setAttribute(clicked, false);
  }

	var imageHeight = canvas.height;
	var imageWidth = canvas.width;

	canvas.height +=20;
  canvas.width +=20;
  let lines = columns= 5;

  context = canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);
	context.fillStyle = "whitesmoke";
	context.fillRect(0, 0, canvas.width, canvas.height);

	let pieceH =  imageHeight / lines;
  let pieceW =  imageWidth / lines;
  var counter = 0;
  var space = 5;//to have a clear view of the pieces

	for(var i=0;i<lines;i++){
			for(var j=0;j<columns;j++){
        //take piece by piece each part from the entire image so that we obtain 25 puzzle pieces
        //have a space between the pieces to notice the splitting

          context.drawImage(imageToCut, j*pieceW, i*pieceH, pieceW, pieceH,
              j*(pieceW+space), i*(pieceH+space), pieceW, pieceH);

        //put all the pieces in an array with their coordinates and their pixels
          pieces.push({
              left:j*(pieceW+space),
              top:i*(pieceH+space),

              width:pieceW,
              height:pieceH,
              id: counter++,
              dragged:false,

              imageData: context.getImageData(j*(pieceW+space),i*(pieceH+space),pieceW,pieceH)
          });
		  }
  }

  document.getElementById("p").innerHTML = "Click on two pieces to interchange them";

  imageOriginal = context.getImageData(0,0,canvas.width,canvas.height);

  shufflePieces(context);
  pieceSelection();
}

// 3. selecting the pieces by clicking them

function pieceSelection(){

  context = canvas.getContext("2d");
  bound = canvas.getBoundingClientRect();

  // offsetX = bound.left;
  // offsetY = bound.top;
  // drag = false;
  
  // canvas.onmousedown = mDown;
  // canvas.onmousemove = mMove;
  // canvas.onmouseup = mUp;

  // matchIndexToPiece();
  
  // drawPuzzle();

  canvas.addEventListener('click', function(event) {

    playSound("\media\\click2.mp3");

    //scaling the canvas relative to the viewport
    var bound = canvas.getBoundingClientRect();

    var scaleX = canvas.width / bound.width;   
    var scaleY = canvas.height / bound.height;  
    
    //getting the real cursor coordinates
    var x = (event.clientX - bound.left) * scaleX;
    var y = (event.clientY - bound.top) * scaleY; 

    // collision detection between clicked offset and element
    pieces.forEach(function(element) {
      if (y > element.top && y < element.top + element.height &&
          x > element.left && x < element.left + element.width) {

        //checking if two pieces were clicked so that swapping can take place
        if(clickIsPressed==false){
          pieceOne=element;
          clickIsPressed = true;
        }else{
          pieceTwo = element;
          clickIsPressed = false;
          swappingPieces(context,pieceOne,pieceTwo);
      }
     }
    });
    imageAfterUserModifies = context.getImageData(0,0,canvas.width,canvas.height);

    if(compareImages(imageAfterUserModifies,imageOriginal)){
 
      document.getElementById("p").innerHTML = "YOUUU WOOON!!!!";
      playSound("\media\\tadaa.mp3");
  
      context.clearRect(0,0,canvas.width, canvas.height);
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(imageToCut,0,0);
    };
  }, false);
}

// function for when user clicks on an image and holds the key
function mDown(e) {

  e.preventDefault();
  e.stopPropagation();

  var scaleX = canvas.width / bound.width;   
  var scaleY = canvas.height / bound.height;

  //find mouse coordinates
  var mx = parseInt(e.clientX - offsetX)*scaleX;
  var my = parseInt(e.clientY - offsetY)*scaleY;

  //check if the piece is dragged
  drag = false;
  for (var i = 0; i < pieces.length; i++) {
      let p = pieces[i];
      if (mx > p.left && mx < p.left + p.width && my > p.top && my < p.top + p.height) {

        playSound("\media\\click2.mp3");
          drag = true;
          p.dragged = true;

          initialLeft = p.left;
          initialTop = p.top;

          pieceDragged.id = p.id;
          pieceDragged.imageData = p.imageData;
          pieceDragged.width = p.width;
          pieceDragged.height = p.height;
      }
  }

  //save mouse position
  startX = mx;
  startY = my;
}

//function for piece movement on screen

function mMove(e) {

  pieceOnDrop = null;
  // if we're dragging a piece
  if (drag) {

      e.preventDefault();
      e.stopPropagation();

      var scaleX = canvas.width / bound.width;   
      var scaleY = canvas.height / bound.height;

      // find mouse current coordinates
      var mx = parseInt(e.clientX - offsetX)*scaleX;
      var my = parseInt(e.clientY - offsetY)*scaleY;

      //distance the mouse moved since last movement
      var dx = mx - startX;
      var dy = my - startY;

      // move each piece the distance the mouse has moved
      for (var i = 0; i < pieces.length; i++) {
          let p = pieces[i];
          if (p.dragged) {
              p.left += dx;
              p.top += dy;
          }
          if(mx > p.left && mx < p.left + p.width && my > p.top && my < p.top + p.height){
             pieceOnDrop = p;
          }
      }
      drawPuzzle();

      // reset mouse position
      startX = mx;
      startY = my;
  }
}

//function for releasing the piece

function mUp(e) {  

  e.preventDefault();
  e.stopPropagation();

  var scaleX = canvas.width / bound.width;   
  var scaleY = canvas.height / bound.height;

  var mx = parseInt(e.clientX - offsetX)*scaleX;
  var my = parseInt(e.clientY - offsetY)*scaleY;

  drag = false;

  for (var i = 0; i < pieces.length; i++) {
    let p = pieces[i];

    //if mouse hovers over a piece and the current piece is dropped
    if(mx > p.left && mx < p.left + p.width && my > p.top && my < p.top + p.height){
  
      pieceDragged.left = Math.round(p.left);
      pieceDragged.top = Math.round(p.top);

      pieceOnDrop.left = initialLeft;
      pieceOnDrop.top = initialTop;

      context.putImageData(pieceOnDrop.imageData,initialLeft,initialTop);
      drawPuzzle();
    }
    console.log(pieces);
    pieces[i].dragged = false;
  }

  //winning event
  if(compareImages(imageOriginal,imageAfterUserModifies)){
    document.getElementById("p").innerHTML = "YOUUU WOOON!!!!";
    playSound("\media\\tadaa.mp3");

    context = canvas.getContext('2d');
    context.clearRect(0,0,canvas.width, canvas.height);
    context.fillStyle = "black";
	  context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(imageToCut,0,0);
  };
}

//redraw puzzle function
function drawPuzzle() {

  context.clearRect(0,0,canvas.width,canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "whitesmoke";
 
  //redraw pieces
  for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
       context.beginPath();
       context.fillRect(Math.floor(piece.left),Math.floor(piece.top),piece.width,piece.height);
       context.closePath();
       context.putImageData(piece.imageData,Math.floor(piece.left),Math.floor(piece.top));
  }
}

// 4. shuffle pieces

function shufflePieces(context){

 for (let i=0;i<30;i++){
   var pieceOne = pieces[Math.floor(Math.random() * pieces.length)];
   var pieceTwo = pieces[Math.floor(Math.random() * pieces.length)];
   swappingPieces(context,pieceOne,pieceTwo);
 }
}

// swapping pieces function
function swappingPieces(context,pieceOne,pieceTwo){

  let tempLeftOne = pieceOne.left;
  let tempTopOne = pieceOne.top;

  let tempLeftTwo = pieceTwo.left;
  let tempTopTwo = pieceTwo.top;

  context.putImageData(pieceOne.imageData,pieceTwo.left,pieceTwo.top);
  context.putImageData(pieceTwo.imageData,pieceOne.left,pieceOne.top);

  pieceOne.left = tempLeftTwo;
  pieceOne.top = tempTopTwo;

  pieceTwo.left = tempLeftOne;
  pieceTwo.top = tempTopOne;

  // swap positions in array;
  let tempPieceOne = pieceOne;
  let tempPieceTwo = pieceTwo;

  pieces[pieces.indexOf(pieceOne)] = tempPieceTwo;
  pieces[pieces.indexOf(pieceTwo)] = tempPieceOne;
}

// 5. verifying if the puzzle is completed
function compareImages(image,imagesec){

  if(image.data.length != imagesec.data.length){
      console.log("data length differs");
      return false;
  }
  for(var i = 0; i < image.data.length; ++i){
      if(image.data[i] != imagesec.data[i]){
          return false;
      }
  }
  return true;
}

// 6. playing sound when clicking a piece or winning game

function playSound(path){
  var audio = document.createElement('audio');
  audio.setAttribute('src', path);
  audio.play();
}

// 7. animation for quickly solving the puzzle

function autoSolve(piece){

        var oldLeft = piece.left;
        var oldTop = piece.top;
  
        if(piece.id >=0 && piece.id <5){
          piece.top = 0;
          piece.left = piece.width*(piece.id%5)+piece.id*5;
        }
        else if(piece.id >=5 && piece.id <10){
          piece.top = piece.height+5;
          piece.left = piece.width*(piece.id%5)+((piece.id%5)*5);
        }
        else if(piece.id >=10 && piece.id <15){
          piece.top = piece.height*2+10;
          piece.left = piece.width*(piece.id%5)+((piece.id%5)*5);
        }
        else if(piece.id >=15 && piece.id <20){
          piece.top = piece.height*3+15;
          piece.left = piece.width*(piece.id%5)+((piece.id%5)*5);
        }
        else if(piece.id >=20 && piece.id <25){
          piece.top = piece.height*4+20;
          piece.left = piece.width*(piece.id%5)+((piece.id%5)*5);
        }
  
        var desiredSpot = context.getImageData(piece.left, piece.top, piece.width, piece.height);
        context.clearRect(piece.left,piece.top,piece.width,piece.height);
        context.clearRect(oldLeft,oldTop,piece.width,piece.height);
        context.putImageData(desiredSpot,oldLeft,oldTop);
}

function animateSolution(){
  imageQuickSolve = context.getImageData(0,0,canvas.width,canvas.height);

  var interval = setInterval(frame, 10);
  function frame() {
      if (compareImages(imageOriginal,imageQuickSolve)) {
          clearInterval(interval);
      } else {
        for(var i = 0; i<pieces.length;i++){
          var piece =pieces[i];
          autoSolve(piece);

          context.beginPath();
          context.fillRect(piece.left,piece.top,piece.width,piece.height);
          context.closePath();
          context.putImageData(piece.imageData,piece.left,piece.top);
        }
      }
  }
}