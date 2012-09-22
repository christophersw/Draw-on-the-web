"use strict";
window.onload = (function(){
    var body = document.getElementById("body");
    var color = "";
    
    for(var i = 0; i<6; i++)
    {
        color += getRandomInt(0,9);
    }
    
    body.style.background = '#' + color; 
});

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}