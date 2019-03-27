(function() {
  let coordinates = [];
  let savedCoordinates = [];
  let canvas = document.querySelector("#polygon");
  const ctx = canvas.getContext("2d");
  const leftPosition = canvas.offsetLeft;
  const topPosition = canvas.offsetTop;
  let point;
  const radius = 5;
  let isDragging = false;
  let figureDragged = [];
  let coordinateBeforeDragged = {};
  let firstTime = true;

  document.querySelector("#polygon").addEventListener("mouseup", e => {
    isDragging = false;
    firstTime = true;
    point = null;
  });

  document.querySelector("#polygon").addEventListener("mousemove", e => {
    if (isDragging) {
      const positionX = coordinateBeforeDragged.x - e.clientX;
      const positionY = coordinateBeforeDragged.y - e.clientY;
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
          f["isDraggable"] = true;
        });
      }

      coordinateBeforeDragged = { x: e.clientX, y: e.clientY };

      savedCoordinates = drawAll(savedCoordinates, coordinates, ctx);
      return;
    }
    if (!point) {
      return;
    }
    point.x = e.clientX - leftPosition;
    point.y = e.clientY - topPosition;
    savedCoordinates = drawAll(savedCoordinates, coordinates, ctx);
  });

  canvas.addEventListener("mousedown", e => {
    let isDuplicatePoint;
    if (point) {
      point = null;
      return;
    }
    if (isDragging) {
      isDragging = false;
      return;
    }
    let stateCoordinate = false;
    clientX = e.clientX - leftPosition;
    clientY = e.clientY - topPosition;

    if (coordinates.length) {
      const p = coordinates[0];
      if (validatePoint(p, { clientX, clientY }, radius)) {
        if (coordinates.length == 2) {
          return;
        }

        savedCoordinates.push([...coordinates]);
        coordinates = [];
        stateCoordinate = true;
      }

      if (!isDuplicatePoint) {
        isDuplicatePoint = coordinates.find((p, index) => {
          if (index !== 0 && validatePoint(p, { clientX, clientY }, radius)) {
            return p;
          }
        });
      }
      if (isDuplicatePoint) {
        return;
      }
    }
    savedCoordinates.forEach(co => {
      co.forEach(p => {
        if (validatePoint(p, { clientX, clientY }, radius)) {
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
        if (validatePoint(p, { clientX, clientY }, radius)) {
          point = p;
        }
      });
    });
  });

  const drawAll = (savedCoordinates, coordinates, ctx) => {
    resetCanvas(ctx);
    savedCoordinates.forEach(coordinates => {
      drawPoints(coordinates, ctx);
    });
    drawPoints(coordinates, ctx);
    return drawFigures(ctx, savedCoordinates);
  };

  const resetCanvas = (ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const validatePoint = (point, coordinate, radius) => {
    const operation =
      Math.pow(coordinate.clientX - point.x, 2) +
      Math.pow(coordinate.clientY - point.y, 2);
    return operation < Math.pow(radius, 2);
  };

  const draw = (ctx, savedCoordinates, point, stateCoordinate) => {
    let state = false;
    let activeFigure;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCoordinates.forEach(coordinates => {
      const p = coordinates[0];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
      }
      ctx.closePath();
      if (ctx.isPointInPath(point.x, point.y) && !stateCoordinate) {
        (state = true), (move = true);
        isDragging = true;
        figureDragged = coordinates;
        coordinateBeforeDragged = point;
        activeFigure = coordinates;
        coordinates.forEach(co => {
          drawPoint(co.x, co.y, radius, ctx);
        });
        return;
      } else {
        ctx.stroke();
      }

      coordinates.forEach(co => {
        drawPoint(co.x, co.y, radius, ctx);
      });
    });

    if (!(stateCoordinate || state)) {
      coordinates.push({ x: clientX, y: clientY });
    }

    drawPoints(coordinates, ctx);
    if (activeFigure) {
      drawFigure(activeFigure, ctx);
    }
  };

  const drawPoint = (x, y, radius, ctx) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawFigure = (figure, ctx) => {
    const p = figure[0];
    ctx.beginPath();

    ctx.moveTo(p.x, p.y);
    for (let i = 1; i < figure.length; i++) {
      ctx.lineTo(figure[i].x, figure[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.stroke();
  };

  const drawPoints = (coor, ctx) => {
    coor.forEach(co => {
      drawPoint(co.x, co.y, radius, ctx);
    });
  };

  const drawFigures = (ctx, savedCoordinates) => {
    let isDraggableFigure;
    let figureDraggable;
    let figures = [...savedCoordinates];
    figures.forEach(coordinates => {
      var p = coordinates[0];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
        if (coordinates[i]["isDraggable"]) {
          isDraggableFigure = true;
          coordinates[i]["isDraggable"] = false;
        } else {
          isDraggableFigure = false;
        }
      }
      ctx.closePath();
      if (isDraggableFigure) {
        figureDraggable = coordinates;
        return;
      }

      ctx.stroke();
    });
    if (figureDraggable) {
      drawFigure(figureDraggable, ctx);
    }
    return figures;
  };
})();
