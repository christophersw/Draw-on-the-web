"use strict";

// Get a reference to the element.
var canvasId = 'Canvas';
var canvas = null;
var context = null;
var paint = false;
var paths = [];
var currentPath;
var clickX = [];
var clickY = [];
var clickDrag = [];
var drawColor = [];
var drawWidth = [];
var selectedWidth;
var selectedColor;
var colorSelect;
var widthSelect;
var eraseX = [];
var eraseY = [];
var erase = false;
    
window.resizeTo = function() {};//no resizing!

window.onload = (function() {
    var eraseButton = document.getElementById("eraseRadio");
    eraseButton.checked = false;
    colorSelect = document.getElementById("colorsSelect");
    widthSelect = document.getElementById("widthSelect");
    canvas = document.getElementById(canvasId);
    context = canvas.getContext("2d");

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var body = document.getElementById("body");
    var color = "";

    for (var i = 0; i < 6; i++) {
        color += getRandomInt(0, 9);
    }
    body.style.background = '#' + color;
    selectedColor = color;
    drawWidth.push(selectedWidth);

    $('#' + canvasId).mousedown(function(e) {
        
        newPath();
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        
        if(erase){
            addErase(mouseX, mouseY);
            paint = true;
        }
        
        else{
            paint = true;
            addClick(mouseX, mouseY);
            redraw();
        }     
         
    });

    $('#' + canvasId).mousemove(function(e) {
        if(erase && paint)
        {
            addErase(e.pageX - this.offsetLeft,  e.pageY - this.offsetTop);
            unDraw();
            redraw();
        }
        else if(paint) {
            addClick(e.pageX - this.offsetLeft , e.pageY - this.offsetTop, true);
            redraw();
        }
    });

    $('#' + canvasId).mouseup(function(e) {
        paint = false;
        erase = false;
        
        eraseButton.checked = false;
    });
    
    function addClick(x, y, dragging) {
        currentPath.clickX.push(x);
        currentPath.clickY.push(y);
        currentPath.drawColor.push(selectedColor);
        currentPath.drawWidth.push(selectedWidth);
        currentPath.clickDrag.push(dragging);
    }
    
    function addErase(x, y)
    {
        eraseX.push(x);
        eraseY.push(y);
    }
        
    function unDraw(){
        for(var p=0; p < paths.length; p++)
        {
            var path = paths[p];
            
            for(var c = 0; c < path.clickX.length; c++)
            {
                for(var e = 0; e < eraseX.length; e++)
                {                      
                    if(10 > Math.abs(path.clickX[c] - eraseX[e]) && 10 > Math.abs(path.clickY[c] - eraseY[e]))
                    {
                        path.clickX.splice(c, 1);
                        path.clickY.splice(c, 1);
                        break;
                    }
                }
            }
        }
    }

    function redraw() {
        canvas.width = canvas.width; // Clears the canvas        
    
        context.lineJoin = "round";
        
        for(var p=0; p < paths.length; p++)
        {
            var path = paths[p];
            
            for (var i = 0; i < path.clickX.length; i++) {
                context.beginPath();
        
                if (path.clickDrag[i] && i) {
        
                    context.strokeStyle = path.drawColor[i];
                    context.lineWidth = path.drawWidth[i];
        
                    context.moveTo(path.clickX[i - 1], path.clickY[i - 1]);
                }
        
                else {
        
                    context.strokeStyle = path.drawColor[i];
                    context.lineWidth = path.drawWidth[i];
        
                    context.moveTo(path.clickX[i] - 1, path.clickY[i]);
                }
        
                context.lineTo(path.clickX[i], path.clickY[i]);
                context.closePath();
                context.stroke();
            }
        }
    }
    
    function newPath()
    {
        currentPath = {
            clickX : [],
            clickY : [],
            clickDrag : [],
            strokeStyle : "",
            lineJoin : "",
            lineWidth : "",
            drawColor : [],
            drawWidth : []
        };
        
        paths.push(currentPath);
    }

    (function getSaved() {
        var savedObj = document.getElementById("saved");

        if (savedObj) {
            var storedData = JSON.parse(savedObj.getAttribute("data-savedDate"));
            paths = storedData.paths;
            redraw();
        }
    })();
});

function setColor() {
    var index = colorSelect.selectedIndex;
    var c = colorSelect.options[index].value;
    if(c) //this will return false if you pick the label...
    {
        selectedColor = c;
    }
}

function setErase(){
    erase = true;
}

function setWidth() {
    var index = widthSelect.selectedIndex;
    var w = widthSelect.options[index].value;
    if(w) //this will return false if you pick the label...
    {
        selectedWidth = w;
    }
}
    
function sendData()
{
 var data = {
     paths : paths,
     url : $('#Iframe').attr("src")
 };
 put("/save", data);
}

function put(id, data) {
    $.ajax(id, {
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'text/json',
        error: function() {
            alert("There was a problem saving... Probably because we don't pay our engineers enough - or at all.");
        }
    }).done(function(replyData) {
        $("#link").html(replyData);
    });
}














