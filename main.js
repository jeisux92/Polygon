var coordinates = [];
var savedCoordinates = [];
var canvas = document.querySelector("#polygon");
var ctx = canvas.getContext("2d");
var leftPosition = canvas.offsetLeft;
var topPosition = canvas.offsetTop;
var point;
var radius = 5;
var isDragging = false;
var figureDragged = [];
var coordinateBeforeDragged = {};
var firstTime = true;
document.querySelector("#polygon").addEventListener("mouseup", e => {
  isDragging = false;
  firstTime = true;
  point = null;
});

document.querySelector("#polygon").addEventListener("mousemove", e => {
  if (isDragging) {
    console.log(coordinateBeforeDragged.x, e.clientX);
    var positionX = coordinateBeforeDragged.x - e.clientX;
    var positionY = coordinateBeforeDragged.y - e.clientY;
    console.log(positionX);
    if (firstTime) {
      figureDragged.forEach(f => {
        f.x -= positionX + leftPosition;
        f.y -= positionY + topPosition;
      });
      firstTime = false;
    } else {
      figureDragged.forEach(f => {
        f.x -= positionX;
        f.y -= positionY;
      });
    }

    coordinateBeforeDragged = { x: e.clientX, y: e.clientY };

    drawFigures();
    drawPoints(coordinates);
    savedCoordinates.forEach(coordinates => {
      drawPoints(coordinates);
    });
    return;
  }
  if (!point) {
    return;
  }
  point.x = e.clientX - leftPosition;
  point.y = e.clientY - topPosition;
  drawFigures();
  drawPoints(coordinates);
  savedCoordinates.forEach(coordinates => {
    drawPoints(coordinates);
  });
});

canvas.addEventListener("mousedown", e => {
  var isDuplicatePoint;
  if (point) {
    point = null;
    return;
  }
  if (isDragging) {
    isDragging = false;
    return;
  }
  var stateCoordinate = false;
  clientX = e.clientX - leftPosition;
  clientY = e.clientY - topPosition;

  if (coordinates.length) {
    var p = coordinates[0];
    if (validatePoint(p, { clientX, clientY })) {
      if (coordinates.length == 1) {
        return;
      }

      savedCoordinates.push([...coordinates]);
      coordinates = [];
      stateCoordinate = true;
    }
    
    
    if (!isDuplicatePoint) {
      isDuplicatePoint = coordinates.find((p, index) => {
        if (index !== 0 && validatePoint(p, { clientX, clientY })) {
          return p;
        }
      });
    }
    if (isDuplicatePoint) {
      return;
    }
  }
  savedCoordinates.forEach(co => {
    co.forEach((p) => {
      if (validatePoint(p, { clientX, clientY })) {
        stateCoordinate = true;
      }
    });
  });

  draw(ctx, savedCoordinates, { x: clientX, y: clientY }, stateCoordinate);

  if (!savedCoordinates.length > 0) {
    return;
  }
  
  savedCoordinates.forEach(co => {
    co.forEach(p => {
      if (validatePoint(p, { clientX, clientY })) {
        point = p;
      }
    });
  });
});

const validatePoint = (point, coordinate) => {
  var operation =
    Math.pow(coordinate.clientX - point.x, 2) +
    Math.pow(coordinate.clientY - point.y, 2);
  return operation < Math.pow(radius, 2);
};

const draw = (ctx, savedCoordinates, point, stateCoordinate) => {
  var state = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  savedCoordinates.forEach(coordinates => {
    var p = coordinates[0];
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    for (var i = 1; i < coordinates.length; i++) {
      ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }
    ctx.closePath();
    if (ctx.isPointInPath(point.x, point.y) && !stateCoordinate) {
      (state = true), (ctx.fillStyle = "yellow");
      ctx.fill();
      ctx.stroke();
      move = true;
      isDragging = true;
      figureDragged = coordinates;
      coordinateBeforeDragged = point;
    } else {
      ctx.stroke();
    }

    coordinates.forEach(co => {
      drawPoint(co.x, co.y);
    });
  });

  if (stateCoordinate || state) {
    drawPoints(coordinates);
    return;
  }

  coordinates.push({ x: clientX, y: clientY });
  drawPoints(coordinates);
};

const drawPoint = (x, y) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawPoints = coor => {
  coor.forEach(co => {
    drawPoint(co.x, co.y);
  });
};

const drawFigures = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  savedCoordinates.forEach(coordinates => {
    var p = coordinates[0];
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    for (var i = 1; i < coordinates.length; i++) {
      ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  });
};
