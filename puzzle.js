
// 1.drag and drop image to begin puzzle

//declaring the necessary variables
var imageToCut = new Image();
var canvas;
var context;
var pieces = [];
var piecesAnim = [];
var pieceOne;
var pieceTwo; 
var moving = false;
var clickIsPressed = false;
var imageOriginal; // to compare image before and after shuffle in order to see if the puzzle is completed
var imageAfterUserModifies;


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

	var imageHeight = canvas.height;
	var imageWidth = canvas.width;

	canvas.height +=20;
	canvas.width +=20;

  context = canvas.getContext('2d');
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

  var space = 5;
  let lines = columns= 5;

	let pieceH =  imageHeight / lines;
  let pieceW =  imageWidth / lines;
  var counter = 0;

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

              imageData: context.getImageData(j*(pieceW+space),i*(pieceH+space),pieceW,pieceH)
          });
		  }
  }

  document.getElementById("p").innerHTML = "Click on two pieces to interchange them";

  imageOriginal = context.getImageData(0,0,canvas.width,canvas.height);

  shufflePieces(context);
  pieceSelection();
}

var moving = false;

// 3. selecting the pieces by clicking them

function pieceSelection(){

  context = canvas.getContext("2d");
  canvas.addEventListener('click', function(event) {

    playSound("\media\\click2.mp3");

    //scaling the canvas relative to the viewport
    var rect = canvas.getBoundingClientRect();

    var scaleX = canvas.width / rect.width;   
    var scaleY = canvas.height / rect.height;  
    
    //getting the real cursor coordinates
    var x = (event.clientX - rect.left) * scaleX;
    var y = (event.clientY - rect.top) * scaleY; 

    // collision detection between clicked offset and element
    pieces.forEach(function(element) {
      if (y > element.top && y < element.top + element.height &&
          x > element.left && x < element.left + element.width) {

        //checking if two pieces were clicked so that swapping can take place
        if(clickIsPressed==false){
          pieceOne=element;
          // context.clearRect(pieceOne.x,pieceOne.y,pieceOne.width,pieceOne.height);
          // context.save();
          // context.drawImage(imageAfterUserModifies,pieceOne.x,pieceOne.y,pieceOne.width,
          //   pieceOne.height, x-(pieceOne.width/2), y-(pieceOne.height/2),pieceOne.width,pieceOne.height);
          // context.restore();
          clickIsPressed = true;

          // document.onmousemove = updatePuzzle;
          // document.onmouseup = pieceDropped;

        }else{
          pieceTwo = element;
          clickIsPressed = false;
          swappingPieces(context,pieceOne,pieceTwo);

          imageAfterUserModifies = context.getImageData(0,0,canvas.width,canvas.height);

          //winning event
          if(compareImages(imageAfterUserModifies,imageOriginal)){
            document.getElementById("p").innerHTML = "YOUUU WOOON!!!!";
            playSound("\media\\tadaa.mp3");

            context = canvas.getContext('2d');
            context.clearRect(0,0,canvas.width, canvas.height);
            context.fillStyle = "black";
	          context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imageToCut,0,0);

          };
        }
      }
    });
  }, false);
}

function updatePuzzle(element){
  if (y > element.top && y < element.top + element.height &&
      x > element.left && x < element.left + element.width) {


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
function compareImages(img1,img2){

  if(img1.data.length != img2.data.length)
      return false;

  //comparing elements by their containing pixels
  for(var i = 0; i < img1.data.length; ++i){
      if(img1.data[i] != img2.data[i])
          return false;
  }
  return true;
}

// 6. playing sound when clicking a piece or winning game

function playSound(path){
  var audio = document.createElement('audio');
  audio.setAttribute('src', path);
  audio.play();
}

var moving = false;

var animation = document.getElementById("anim");
animation.addEventListener("mousedown", initialClick, false);


function move(e){

  var newX = e.clientX - 10;
  var newY = e.clientY - 10;
  
  image.style.left = newX + "px";
  image.style.top = newY + "px";  
}
  
function initialClick(e) {
  
  if(moving){
    document.removeEventListener("mousemove", move);
    moving = !moving;
    return;
  }
    
  moving = !moving;
  image = this;
  
  document.addEventListener("mousemove", move, false);
}


//7. animation for complete image

function autoSolve(){

  context = canvas.getContext('2d');
  

  

}
