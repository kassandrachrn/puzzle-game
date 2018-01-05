
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
    var canvW = image.width, canvH = image.height;
    
    $("#puzzleImage")
        .attr({ width: canvW, height: canvH });
    
    var context = $("#puzzleImage")[0].getContext("2d");
    context.drawImage(image, 0, 0);

    document.getElementById("pOne").innerHTML = "Click on the picture to start the game";
}




