
// 1.drag and drop functionality

var imageToCut = new Image();
var canvas;
var pieces = [];
var pieceOne;
var pieceTwo;
var clickIsPressed = false;


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

    var context = $("#puzzleImage")[0].getContext("2d");
    context.drawImage(image,0,0);

    canvas = document.getElementById("puzzleImage");

    document.getElementById("p").innerHTML = "Click button to begin";

    imageToCut.src = canvas.toDataURL();


}

// 2. splitting the image in puzzle pieces

function splitImage(){


	var imageHeight = canvas.height;
	var imageWidth = canvas.width;

	canvas.height +=20;
	canvas.width +=20;

  var context = canvas.getContext('2d');
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var space = 5;
	let lines = 5;

	let stepV =  imageHeight / lines;
	let stepH =  imageWidth / lines;

	for(var i=0;i<lines;i++){
			for(var j=0;j<lines;j++){
                    context.drawImage(imageToCut, j*stepH, i*stepV, stepH, stepV,
                        j*(stepH+space), i*(stepV+space), stepH, stepV);
                          pieces.push({
                            left:j*(stepH+space),
                            top:i*(stepV+space),
                            width:stepH,
                            height:stepV,
                            imageData: context.getImageData(j*(stepH+space),i*(stepV+space),stepH,stepV)
                          });
		                    }
    }

    document.getElementById("p").innerHTML = "Move and connect the pieces by clicking them";


    canvas.addEventListener('click', function(event) {

    var rect = canvas.getBoundingClientRect();

    var scaleX = canvas.width / rect.width;   // relationship bitmap vs. element for X
    var scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for

    var x = (event.clientX - rect.left) * scaleX;
    var y = (event.clientY - rect.top) * scaleY;

    // Collision detection between clicked offset and element.
    pieces.forEach(function(element) {
      if (y > element.top && y < element.top + element.height && x > element.left && x < element.left + element.width) {

            if(clickIsPressed==false){
              pieceOne=element;
              clickIsPressed = true;
            }else{
              console.log("clicked 2");
              pieceTwo = element;
              clickIsPressed = false;
              swappingPieces(context,pieceOne,pieceTwo);
            }
      }
    });

  }, false);

    console.log(pieces);
}

// 3. selecting objects

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

  // Swapp positions in array;
  let tempPieceOne = pieceOne;
  let tempPieceTwo = pieceTwo;

  pieces[pieces.indexOf(pieceOne)] = tempPieceTwo;
  pieces[pieces.indexOf(pieceTwo)] = tempPieceOne;

}

// 4. Randomize puzzle
