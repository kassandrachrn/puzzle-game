
// 1.drag and drop functionality

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

    document.getElementById("p").innerHTML = "Click button to begin";
}

// 2. splitting the image in puzzle pieces

function splitImage(){

    var image = new Image();
	var canvas = document.getElementById("puzzleImage");
	image.src = canvas.toDataURL();
	
	var imageHeight = canvas.height;
	var imageWidth = canvas.width;
	
	canvas.height += 20;
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
                    context.drawImage(image, j*stepH, i*stepV, stepH, stepV,
                        j*(stepH+space), i*(stepV+space), stepH, stepV);
		}
    }

    document.getElementById("p").innerHTML = "Move and connect the pieces by clicking them";
}

// 3. shuffling the pieces 

var mouse = {x:0,y:0};

function shuffleArray(array){
    for(var j, x, i = array.length;i;j = parseInt(Math.random() * i), 

    x = array[--i], 
    array[i] = array[j],
    array[j] = x);

    return array;
}

var canvas = document.getElementById("puzzleImage");
var context = canvas.getContext('2d');

function shufflePieces(){

    pieces = shuffleArray(pieces);

    context.clearRect(0,0,canvas.width,canvas.height);

    var i, piece,xpos = 0; ypos = 0;

    for(i = 0; i<pieces.length;i++){

        piece = pieces[i];
        piece.xpos = xpos;
        piece.ypos = ypos;

        context.drawImage(image, piece.sx, piece.sy,piece.width, piece.height,
        xpos,ypos,piece.width,piece.height);
        context.strokeRect(xpos,ypos,piece.width,piece.height);

        xpos += piece.width;

        if(xpos >= canvas.width){

            xpos = 0;
            ypos += piece.height;
        }
    }
    document.onmousedown = onPieceClicked;
}

function onPieceClicked(e){

    var currentPiece = null;

    if(e.layerX || e.layerY == 0){

        mouse.x = e.layerX - canvas.offsetLeft;
        mouse.y = e.layerY - canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        mouse.x = e.offsetX - canvas.offsetLeft;
        mouse.y = e.offsetY - canvas.offsetTop;
    }

    currentPiece = checkClick();

    if(currentPiece != null){

        context.clearRect(currentPiece.xpos,currentPiece.ypos,piece.width,piece.height);
        context.save();

        context.drawImage(image, currentPiece.sx, currentPiece.sy, piece.width,piece.height,
        mouse.x - (piece.width/2), mouse.y - (piece.height/2),piece.width, piece.height);

        context.restore();

        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }

}

function checkClick(){

    var i, piece;

    for(i = 0; i< pieces.length; i++){
        piece = pieces[i];
        if(mouse.x < piece.xpos || mouse.x > (piece.xpos + piece.width)
        || mouse.y < piece.ypos || mouse.y > (piece.ypos = piece.height)){
        }
        else{
            return piece;
        }
    }
    return null;
}







