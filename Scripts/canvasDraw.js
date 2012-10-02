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
var pathCollection = [];


/* The Current Canvas 
 *   is used to draw the current path.
 *   used to improve performance by only re-drawing
 *   What is currently being drawn.
 */
var currentCanvasId = "currentCanvas";
var currentCanvas = null;

var currentPath;
var selectedWidth;
var selectedColor;

/*Erase Variables (current) */
var eraseButton = null;
var eraseX = [];
var eraseY = [];
var erase = false;

/* Other Current Variables */
var select = false;
var draw = true;


/*UI Element Variable*/
var activeColor = "";
var inactiveColor = "";
var saved = true;

//draw controls
var drawControls = null;
var drawButton = null;
var colorsDraw;
var widthDraw;

//select controls
var colorsSelect;
var widthSelect;
var selectControls = null;
var selectButton = null;



/*Selection Variables*/
var selection= {
    subPaths : [],
    path : new Path(
            1, 
            activeColor, 
            [0,0],
            [0,0],
            "square"),
    selectStartX : 0,
    selectStartY : 0
    };
    
var selectButton = null;

window.resizeTo = function() {}; //no resizing!

window.onload = function() {

    //select controls
    selectControls = document.getElementById("selectControls");
    selectButton = document.getElementById("selectButton");
    colorsSelect = document.getElementById("colorsSelect");
    widthSelect = document.getElementById("widthSelect");
    
    //draw controls
    drawControls = document.getElementById("drawControls");
    drawButton = document.getElementById("drawButton");
    eraseButton = document.getElementById("eraseRadio");
    eraseButton.checked = false;
    colorsDraw = document.getElementById("colorsDraw");
    widthDraw = document.getElementById("widthDraw");
    
     
    currentCanvas = document.getElementById(currentCanvasId);
    backgroundCanvas = document.getElementById(backgroundCanvasId);

    getSaved();

    setUIColors();
    var body = document.getElementById("body");
    body.style.background = activeColor;

    //default start state is draw.
    setDrawColor();
    setDrawWidth();
    setDraw();
    
    newPath();
    

    currentCanvas.addEventListener('touchstart', start, false);
    currentCanvas.addEventListener('mousedown', start, false);
    currentCanvas.addEventListener('touchmove', move, false);
    currentCanvas.addEventListener('mousemove', move, false);
    currentCanvas.addEventListener('touchend', finish, false);
    currentCanvas.addEventListener('mouseup', finish, false);
    currentCanvas.addEventListener('mouseout', finish, false);
    document.addEventListener('keydown', key, false);
};

function setUIColors() {
    //active
    for (var i = 0; i < 6; i++) {
        activeColor += getRandomInt(0, 9);
    }
    activeColor = '#' + activeColor;

    //inactive
    inactiveColor = '#ffffff';
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*************************
 *   EVENT LISTENERS     *
 *************************/

function start(event) {
    if (select) {
        startSelected(event);
    }
    else if (draw) {
        startDraw(event);
    }
}

function move(event) {
    if (select) {
        moveSelect(event);
    }
    else if (draw) {
        moveDraw(event);
    }
}

function finish(event) {
    if (select) {
        finishSelect(event);
    }
    else if (draw) {
        finishDraw(event);
    }
}

function del(event){
    if(select)
    {
        selectDelete();
    }
    else if (draw)
    {
        
    }
}

function key(event){
    if(event !== undefined){
        var keycode = event.keyCode;
        switch (keycode){
            case 46:
                del(event);
                break;
        }
    }
    
    
}

function resetControls() {
    draw = false;
    select = false;
    
    drawControls.style.display = 'none';
    selectControls.style.display = 'none';
   
    drawButton.style.display = 'inline';
    selectButton.style.display = 'inline';
    
}
 
 
/************************
 *   SELECT FUNCTIONS   *
 * **********************/
var dragging = false;
var selecting = false;

function setSelect() {

    resetControls();
    select = true;

    selectControls.style.display = 'inline';
    selectButton.style.display = 'none';
}

function startSelected(event) {
    dragging = true;

    var mouseX = event.layerX;
    var mouseY = event.layerY;

    if (selection.path.isInside(mouseX, mouseY)) {
        selecting = false;
        selection.selectStartX = mouseX;
        selection.selectStartY = mouseY;
    }

    //This click was outside the current selection, or there is no selection path.
    else {
        selection.subPaths = []; // clear the selected subpaths, so we can push a single one... 
        
        for (var i = 0; i < pathCollection.length; i++) {
            if (pathCollection[i].isInside(mouseX, mouseY)) {
                for (var x = 0; x < pathCollection[i].xPos.length; x++) {
                    var path = pathCollection[i];
                    if (Math.abs(mouseX - path.xPos[x]) < 5 && Math.abs(mouseY - path.yPos[x]) < 5) {
                        selection.path.xPos = [path.maxX(), path.minX()];
                        selection.path.yPos = [path.maxY(), path.minY()];
                        selection.subPaths[0] = path;
                        selection.subPaths[0].fromPathIndex = i;
                        selection.selectStartX = mouseX;
                        selection.selectStartY = mouseY;
                        currentCanvas.width = currentCanvas.width; //Clear Current canvas...
                        selection.path.drawBoxAround(currentCanvas);
                        selecting = false;
                        break;
                    }
                }
            }
        }

        if (selection.subPaths.length === 0) {
            selection.path.xPos[0] = mouseX;
            selection.path.yPos[0] = mouseY;
            selecting = true;
        }
    }
}

function moveSelect(event) {

    var mouseX = event.layerX;
    var mouseY = event.layerY;

    if (dragging) {
        if (!selecting) { //move the currently selected group...
            var i; //counter...
            var XAmount = mouseX - selection.selectStartX;
            var YAmount = mouseY - selection.selectStartY;
            selection.selectStartX = mouseX;
            selection.selectStartY = mouseY;

            //loop the selected paths
            for (var p = 0; p < selection.subPaths.length; p++) {
                
                //loop the svg points. 
                for (i = 0; i < selection.subPaths[p].xPos.length; i++) {
                    selection.subPaths[p].xPos[i] += XAmount;
                    selection.subPaths[p].yPos[i] += YAmount;
                    
                }   
                
                
                pathCollection[selection.subPaths[p].fromPathIndex] = selection.subPaths[p];
            }
            
            //loop through selection box         
            for (i = 0; i < selection.path.xPos.length; i++)
            {
                selection.path.xPos[i] += XAmount;
                selection.path.yPos[i] += YAmount;
            }

            redrawBackground();

            currentCanvas.width = currentCanvas.width; //Clear Current canvas...
            selection.path.drawBoxAround(currentCanvas);
        }

        else { //make a bulk selection
            selection.path.xPos[1] = mouseX;
            selection.path.yPos[1] = mouseY;

            currentCanvas.width = currentCanvas.width; //Clear Current canvas...
            selection.path.drawBoxAround(currentCanvas);
        }
    }

}

function finishSelect(event) {
    var x;
    if (dragging) {
        //something was selected  
        if (selecting) {
            selection.subPaths = []; //clear current sub paths...

            //used for tracking the min and max x's and y's insided the selected set to resize (shrink) the selection box. 
            var maxX = 0;
            var minX = 99999;
            var maxY = 0;
            var minY = 99999;

            for (x = 0; x < pathCollection.length; x++) {


                var pathMaxX = pathCollection[x].maxX();
                var pathMaxY = pathCollection[x].maxY();
                var pathMinX = pathCollection[x].minX();
                var pathMinY = pathCollection[x].minY();

                if (selection.path.isInside(pathMaxX, pathMaxY) && selection.path.isInside(pathMinX, pathMinY)) {
                    if (maxX < pathMaxX)(maxX = pathMaxX);
                    if (maxY < pathMaxY)(maxY = pathMaxY);
                    if (minX > pathMinX)(minX = pathMinX);
                    if (minY > pathMinY)(minY = pathMinY);

                    selection.subPaths.push(pathCollection[x]);
                    selection.subPaths[selection.subPaths.length-1].fromPathIndex = x;
                }
            }

            //subpaths found...then box them, otherwise set selected path to 0,0 : 0,0
            selection.path.xPos = (selection.subPaths.length > 0) ? [minX, maxX] : [0, 0];
            selection.path.yPos = (selection.subPaths.length > 0) ? [minY, maxY] : [0, 0];
        }

        //redrawBackground();
        currentCanvas.width = currentCanvas.width; //Clear Current canvas...
        selection.path.drawBoxAround(currentCanvas);

        //clear flasgs
        dragging = false;
        selecting = false;
    }
}

function selectDelete(){
    
    for(var i = 0; i < selection.subPaths.length; i++)
    {        
        pathCollection.splice(selection.subPaths[i].fromPathIndex - i,1);
    }
    
    selection.subPaths = []; //reset the subpaths to nothing.
    selection.path.xPos = [0,0];
    selection.path.yPos = [0,0];
    
    redrawBackground();
    
}

function setSelectColor(){
    var index = colorsSelect.selectedIndex;
    var c = colorsSelect.options[index].value;
    var newColor;
    
    if (c === "custom") {
        var p = prompt("Input Custom Color Code (ex. #000000):", '#000000');
        if (p) {
            newColor = p;
            colorsSelect.style.background = p;
        }
    }
    else if (c) //this will return false if you pick the label...
    {
        newColor = c;
        colorsSelect.style.background = colorsDraw.options[index].style.background;
        colorsSelect.style.color = colorsDraw.options[index].style.color; 
    }   
    
    for(var i = 0; i < selection.subPaths.length; i++)
    {
        selection.subPaths[i].lineColor = newColor;  
        pathCollection[selection.subPaths[i].fromPathIndex] = selection.subPaths[i];
    }
    
    redrawBackground();
    selection.path.drawBoxAround(currentCanvas);
}

function setSelectWidth(){
    var index = widthSelect.selectedIndex;
    var w = widthSelect.options[index].value;
    if (w) //this will return false if you pick the label...
    {
        for(var i = 0; i < selection.subPaths.length; i++)
        {
            selection.subPaths[i].lineWidth = w;
            pathCollection[selection.subPaths[i].fromPathIndex] = selection.subPaths[i];
        }
        
        redrawBackground();
        selection.path.drawBoxAround(currentCanvas);
    }
}


/*************************
 *     DRAW FUNCTIONS    *
 *************************/
var paint = false;
function setDraw() {

    resetControls();
    draw = true;

    drawControls.style.display = 'inline';
    drawButton.style.display = 'none';

}

function startDraw(event) {
    newPath();
    
    var mouseX = event.layerX ;
    var mouseY = event.layerY ;

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
    
    var mouseX = event.layerX;
    var mouseY = event.layerY;
    
    if (erase && paint) {
        addErase(mouseX, mouseY);
        unDraw();
        redrawBackground();
    }
    else if (paint) {
        currentPath.addPoint(mouseX, mouseY, true);
        redrawCurrent();
    }

    event.preventDefault();
}

function finishDraw(event) {
    if(paint)
    {
        paint = false;
        pathCollection.push(currentPath);
        redrawBackground();
    }
    event.preventDefault();
}

function setDrawColor() {
    var index = colorsDraw.selectedIndex;
    var c = colorsDraw.options[index].value;
    if (c === "custom") {
        var p = prompt("Input Custom Color Code (ex. #000000):", '#000000');
        if (p) {
            selectedColor = p;
            colorsDraw.style.background = p;
        }
    }
    else if (c) //this will return false if you pick the label...
    {
        selectedColor = c;
        colorsDraw.style.background = colorsDraw.options[index].style.background;
        colorsDraw.style.color = colorsDraw.options[index].style.color; 
    }
}

function setErase() {
    erase = !erase;
    eraseButton.checked = erase;
}

function setDrawWidth() {
    var index = widthDraw.selectedIndex;
    var w = widthDraw.options[index].value;
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
    for (var p = 0; p < pathCollection.length; p++) {
        var path = pathCollection[p];

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
    this.lineWidth = (typeof lineWidth === "string") ? lineWidth : 5,
    this.lineColor = (typeof lineColor === "string") ? lineColor : "#000000",
    this.lineJoin = (typeof lineJoin === "string") ? lineJoin : "round",
    this.xPos = (typeof xPos !== "undefined") ? xPos : [],
    this.yPos = (typeof yPos !== "undefined") ? yPos : [];
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

Path.prototype.drawBoxAround = function(canvas, strokeStyle) {

    var context = canvas.getContext("2d");
    context.strokeStyle = (typeof strokeStyle !== "undefined") ? strokeStyle : "#000000";
    var x = this.minX();
    var y = this.minY();
    var width = this.maxX() - this.minX();
    var height = this.maxY() - this.minY();

    context.strokeRect(x, y, width, height);
    context.stroke();

    return;
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

function deleteAllPaths() {
    pathCollection = [];
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

    for (var p = 0; p < pathCollection.length; p++) {
        pathCollection[p].drawOnCanvas(backgroundCanvas);
    }
    
    setUnsaved();
}

function redrawCurrent() {
    currentCanvas.width = currentCanvas.width; // Clears the canvas        
    currentPath.drawOnCanvas(currentCanvas, true);
}

/*************************
 *   SAVING FUNCTIONS    *
 *************************/

function setUnsaved(){
    saved = false;
    setTimeout(function() {
        checkSaveButton();
    }, 0);
}
function checkSaveButton(){
    if(!saved && pathCollection.length > 0)
    {
        document.getElementById("saveButton").style.display = "inline";
    }
    else{
        document.getElementById("saveButton").style.display = "none";
    }
}

function sendData() {
    var data = {
        paths: pathCollection,
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
        saved = true;
        checkSaveButton();
    }, JSON.stringify(data));
}

function getSaved() {
    var savedObj = document.getElementById("saved");
    
    if (savedObj) {
        var storedData = JSON.parse(savedObj.getAttribute("data-savedDate"));
        for(var i = 0; i < storedData.paths.length; i++)
        {            
            var sd = storedData.paths[i];
            
            //lineWidth, lineColor, xPos, yPos, lineJoin
            var spath = new Path(
                    sd.lineWidth,
                    sd.lineColor, 
                    sd.xPos, 
                    sd.yPos, 
                    sd.lineJoin
                );
            pathCollection.push(spath);
        }
        redrawBackground();
        
        
        
        
    }
}
