var coordinates = [];
var savedCoordinates = [];
var canvas = document.querySelector("#polygon");
var ctx = canvas.getContext("2d");
var leftPosition = canvas.offsetLeft;
var topPosition = canvas.offsetTop;

canvas.addEventListener("click",(e)=>{
  var stateCoordinate = false;
  clientX = e.clientX - leftPosition;
  clientY = e.clientY - topPosition;
   
  if(coordinates.length){
  
    var p = coordinates[0]
    if((p.x-10<clientX && clientX<p.x+10)&&
      (p.y-10<clientY && clientY<p.y+10)){
      if(coordinates.length==1){
      return;
    }
         
        savedCoordinates.push([...coordinates]);
        coordinates = [];
        stateCoordinate= true;
      
    }
    var otherPoints = JSON.parse(JSON.stringify(coordinates));
    otherPoints.shift();
    var duplicatePoint = otherPoints.find(p=>{
    if((p.x-10<clientX && clientX<p.x+10)&&
      (p.y-10<clientY && clientY<p.y+10)){
      return p;
    }  
    });
    if(duplicatePoint){
      return;
    }
    
  }
  draw(ctx,savedCoordinates,{x:clientX,y:clientY},stateCoordinate);
  
       
})

function draw(ctx,savedCoordinates,point,stateCoordinate){  
        var state = false;
        var canvas = document.querySelector("#polygon");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        savedCoordinates.forEach(coordinates=>{
          
          var p = coordinates[0];                   
          ctx.beginPath();  
          ctx.moveTo(p.x, p.y);
          for(var i=1;i<coordinates.length;i++){            
            ctx.lineTo(coordinates[i].x,coordinates[i].y)
          }         
          ctx.closePath();
          if(ctx.isPointInPath(point.x,point.y) && !stateCoordinate){
            state = true,
            ctx.fillStyle="yellow"  ;
            ctx.fill();
            ctx.stroke(); 
          }
          else{
            ctx.stroke();  
          }
          
          
          coordinates.forEach(co=>{
            drawPoint(co.x,co.y);
          })
        })
  
  
        if(stateCoordinate  || state){
           coordinates.forEach(co=>{
            drawPoint(co.x,co.y);
           })
          return;
        }
        
        coordinates.push({x:clientX, y:clientY}); 
        coordinates.forEach(co=>{
          drawPoint(co.x,co.y);
        })
}


function drawPoint(x ,y){
          var canvas = document.querySelector("#polygon");
          var ctx = canvas.getContext("2d");
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.stroke();
}