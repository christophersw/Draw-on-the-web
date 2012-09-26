"use strict";

/*************************
 *   VARIABLES/OBJECTS   *
 *************************/
/* The Background Canvas 
 *   is used to store the non-active path.
 *   the prupose of this is to avoid triggering
 *   a large redraw for every mouse action.
 */
var backgroundCanvasId = "backgroundCanvas";
var backgroundCanvas = null;
var backgroundContext = null;
var paths = [];

/* The Current Canvas 
 *   is used to draw the current path.
 *   used to improve performance by only re-drawing
 *   What is currently being drawn.
 */
var currentCanvasId = "currentCanvas";
var currentCanvas = null;
var currentContext = null;
var currentPath;
var selectedWidth;
var selectedColor;

/*Erase Variables (current) */
var eraseButton = null;
var eraseX = [];
var eraseY = [];
var erase = false;

/* Other Current Variables */
var paint = false;
var select = true;

/*UI Element Variable*/
var colorSelect;
var widthSelect;

/*Selection Variables*/
var selectedPath = null;
var selectButton = null;

window.resizeTo = function() {}; //no resizing!

window.onload = function() {
    eraseButton = document.getElementById("eraseRadio");
    selectButton = document.getElementById("selectButton");
    eraseButton.checked = false;
    colorSelect = document.getElementById("colorsSelect");
    widthSelect = document.getElementById("widthSelect");
    currentCanvas = document.getElementById(currentCanvasId);
    backgroundCanvas = document.getElementById(backgroundCanvasId);
    
    getSaved();

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var body = document.getElementById("body");
    var color = "";

    for (var i = 0; i < 6; i++) {
        color += getRandomInt(0, 9);
    }
    body.style.background = '#' + color;
    setColor();
    setWidth();
    setSelect();
    newPath();

    currentCanvas.addEventListener('touchstart', start, false);
    currentCanvas.addEventListener('mousedown', start, false);
    currentCanvas.addEventListener('touchmove', move, false);
    currentCanvas.addEventListener('mousemove', move, false);
    currentCanvas.addEventListener('touchend', finish, false);
    currentCanvas.addEventListener('mouseup', finish, false);
    currentCanvas.addEventListener('mouseout', finish, false);
};

/*************************
 *   EVENT LISTENERS     *
 *************************/

function start(event) {
    if (select) {
        startSelected(event);
    }
    else {
        startDraw(event);
    }
}

function move(event) {
    if (select) {

    }
    else {
        moveDraw(event);
    }
}

function finish(event) {
    if (select) {

    }
    else {
        finishDraw(event);
    }
}

function setSelect(){
    select = !select;
    
    if(select)
    {
        selectButton.innerHTML = "Draw";
    }
    else
    {
       selectButton.innerHTML = "Select";
    }
}

/************************
 *   SELECT FUNCTIONS   *
 * **********************/

function startSelected(event){
    var mouseX = event.pageX - currentCanvas.offsetLeft;
    var mouseY = event.pageY - currentCanvas.offsetTop;
    
    for(var i = 0; i < paths.length; i++)
    {
        if(paths[i].isInside(mouseX, mouseY))
        {
            currentCanvas.width = currentCanvas.width; //Clear Current canvas...
            paths[i].drawBoxAround(currentCanvas);
            break;
        }    
    }    
}


/*************************
 *     DRAW FUNCTIONS    *
 *************************/

function startDraw(event) {
   newPath();
   document.getElementById("saveButton").style.display = "inline";


    var mouseX = event.pageX - currentCanvas.offsetLeft;
    var mouseY = event.pageY - currentCanvas.offsetTop;

    if (erase) {
        currentPath.addPoint(mouseX, mouseY);
        paint = true;
    }

    else {
        paint = true;
        currentPath.addPoint(mouseX, mouseY);
        redrawCurrent();
    }

    event.preventDefault();
}

function moveDraw(event) {
    if (erase && paint) {
        addErase(event.pageX - currentCanvas.offsetLeft, event.pageY - currentCanvas.offsetTop);
        unDraw();
        redrawBackground();
    }
    else if (paint) {
        currentPath.addPoint(event.pageX - currentCanvas.offsetLeft, event.pageY - currentCanvas.offsetTop, true);
        redrawCurrent();
    }

    event.preventDefault();
}

function finishDraw(event) {
    paths.push(currentPath);
    redrawBackground();
    paint = false;
    event.preventDefault();
}

function setColor() {
    var index = colorSelect.selectedIndex;
    var c = colorSelect.options[index].value;
    if (c === "custom") {
        var p = prompt("Input Custom Color Code (ex. #000000):", '#000000');
        if (p) {
            selectedColor = p;
        }
    }
    else if (c) //this will return false if you pick the label...
    {
        selectedColor = c;
    }
}

function setErase() {
    erase = !erase;
    eraseButton.checked = erase;
}

function setWidth() {
    var index = widthSelect.selectedIndex;
    var w = widthSelect.options[index].value;
    if (w) //this will return false if you pick the label...
    {
        selectedWidth = w;
    }
}

function addErase(x, y) {
    eraseX.push(x);
    eraseY.push(y);
}

function unDraw() {
    for (var p = 0; p < paths.length; p++) {
        var path = paths[p];

        for (var e = 0; e < eraseX.length; e++) {
            if (eraseX[e] > path.xMax || eraseX[e] < path.xMin || eraseY[e] > path.yMax || eraseY[e] < path.yMin) {
                continue;
            }
            else {
                for (var c = 0; c < path.xPos.length; c++) {
                    if (10 > Math.abs(path.xPos[c] - eraseX[e]) && 10 > Math.abs(path.yPos[c] - eraseY[e])) {
                        path.xPos.splice(c, 1);
                        path.yPos.splice(c, 1);
                        redrawBackground();
                        break;
                    }
                }
            }
        }

    }
}

/***********************************************************************************
 *     PATH OBJECT       
 *---------------------------------------------------------
 * Summary: An object used to draw paths on HTML5 Canvases
 * 
 * Properties:
 * lineWidth = the width of the line to draw
 * drawColor = the color of the line to draw
 * lineJoin = the endcap style of the line
 * xPos = Array of x positions (draw first to last)
 * yPos = Array of coorsponding y positions
 *  
 * Prototypical Functions:
 * maxX(), maxY(), minX(), minY() = used to calculated the max and min xPos and yPos 
 * addPoint(x, y) = adds a point to draw at x and y coords
 * drawOnCanvas(canvas) = draws a path along the xPos and yPox on given canvas
 * 
 ************************************************************************************/

function Path(lineWidth, lineColor, xPos, yPos, lineJoin) {
    this.lineWidth = (typeof lineWidth ==="string") ? lineWidth : 5,
    this.lineColor = (typeof lineColor ==="string") ? lineColor : "#000000",
    this.lineJoin = (typeof lineJoin ==="string") ? lineJoin : "round",
    this.xPos = (typeof xPos !=="undefined") ?  xPos : [],
    this.yPos = (typeof yPos !=="undefined") ?  yPos : [];
}

Path.prototype.maxX = function() {
   return Math.max.apply(null, this.xPos);
};

Path.prototype.minX = function() {
    return Math.min.apply(null, this.xPos);
};

Path.prototype.maxY = function() {
    return Math.max.apply(null, this.yPos);
};

Path.prototype.minY = function() {
    return Math.min.apply(null, this.yPos);
};

Path.prototype.isOutside = function(x, y) {
    return (x > this.maxX() || x < this.minX() || y > this.maxY() || y < this.minY());
};

Path.prototype.isInside = function(x, y) {
    return (x <= this.maxX() && x >= this.minX() && y <= this.maxY() && y >= this.minY());
};

Path.prototype.addPoint = function(x, y) {
    this.xPos.push(x);
    this.yPos.push(y);
};

Path.prototype.drawOnCanvas = function(canvas) {
    var context = canvas.getContext("2d");
    context.lineJoin = this.lineJoin;
    context.strokeStyle = this.lineColor;
    context.lineWidth = this.lineWidth;

    for (var i = 0; i < this.xPos.length; i++) {
        context.beginPath();
        context.moveTo(this.xPos[i - 1], this.yPos[i - 1]);
        context.lineTo(this.xPos[i], this.yPos[i]);
        context.closePath();
        context.stroke();
    }
    
    return;
};

Path.prototype.drawBoxAround = function(canvas, strokeStyle){
      
      var context = canvas.getContext("2d");
      context.strokeStyle = (typeof strokeStyle !=="undefined") ?  strokeStyle : "#000000";
      var x = this.minX();
      var y = this.minY();
      var width = this.maxX() - this.minX();
      var height = this.maxY() - this.minY();
      
      context.strokeRect (x,y, width, height);
      context.stroke();
      
      return
};



/*************************
 *    CANVAS FUNCTIONS   *
 *************************/
 
 function newPath() {
    //commit the background... when you have a chance..
    window.setTimeout(redrawBackground, 0);
    
    //set up new current path.
    currentPath = new Path(selectedWidth, selectedColor);
}

function deleteAllPaths()
{
    paths = [];
    newPath();
    redrawBackground();
    redrawCurrent();
}
 
/* redrawBackground():  Redraws Background Canvas
 *   This method will redraw all of the path elements to the background
 *   canvas. For performance this should never be used when a draw to the current
 *   path will do. Think of this as a store for the actual image, to be 
 *   writen when the current path is complete. 
 */
function redrawBackground() {
    currentCanvas.width = currentCanvas.width; //Clear Current canvas...
    backgroundCanvas.width = backgroundCanvas.width; // Clears the canvas        

    for (var p = 0; p < paths.length; p++) {
    
        paths[p].drawOnCanvas(backgroundCanvas);
        
    }
}

function redrawCurrent() {
    currentCanvas.width = currentCanvas.width; // Clears the canvas        
    currentPath.drawOnCanvas(currentCanvas, true);
}

/*************************
 *   SAVING FUNCTIONS    *
 *************************/

function sendData() {
    var data = {
        paths: paths,
        url: document.getElementById('Iframe').getAttribute("src")
    };
    put("/save", data);
}

function put(id, data) {
    var saveSatus = document.getElementById("saveSatus");
    saveSatus.innerHTML = "Saving...";
    saveSatus.style.display = "inline";
    saveSatus.style.textDecoration = "blink";
    sendRequest(id, function(replyData) {
        var link = document.getElementById("link");
        link.innerHTML = replyData.responseText;
        saveSatus.innerHTML = "Saved: ";
        saveSatus.style.textDecoration = "none";
    }, JSON.stringify(data));
}

function getSaved() {
    var savedObj = document.getElementById("saved");

    if (savedObj) {
        var storedData = JSON.parse(savedObj.getAttribute("data-savedDate"));
        paths = storedData.paths;
        redrawBackground();
    }
}
