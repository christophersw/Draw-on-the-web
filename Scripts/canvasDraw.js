"use strict";
// Get a reference to the element.
var canvasId = 'Canvas';
var canvas = null;
var context = null;
var paint = false;
var clickX = [];
var clickY = [];
var clickDrag = [];
    
window.resizeTo = function() {};//no resizing!

window.onload = (function() {

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

    $('#' + canvasId).mousedown(function(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(mouseX, mouseY);
        redraw();
    });

    $('#' + canvasId).mousemove(function(e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft , e.pageY - this.offsetTop, true);
            redraw();
        }
    });

    $('#' + canvasId).mouseup(function(e) {
        paint = false;
    });

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function redraw() {
        canvas.width = canvas.width; // Clears the canvas        

        context.strokeStyle = '#' + color;
        context.lineJoin = "round";
        context.lineWidth = 5;

        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            }
            else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }

    (function getSaved() {
        var savedObj = document.getElementById("saved");

        if (savedObj) {
            var storedData = JSON.parse(savedObj.getAttribute("data-savedDate"));
            context.strokeStyle = storedData.strokeStyle;
            context.lineJoin = storedData.lineJoin;
            context.lineWidth = storedData.lineWidth;
            clickDrag = storedData.clickDrag;
            clickX = storedData.clickX;
            clickY = storedData.clickY;
            redraw();
        }
    })();
});

function sendData()
{
 var data = {};
 data.strokeStyle = context.strokeStyle;
 data.lineJoin = context.lineJoin;
 data.lineWidth = context.lineWidth;
 data.clickDrag = clickDrag;
 data.clickX = clickX;
 data.clickY = clickY;
 data.url = $('#Iframe').attr("src");
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














