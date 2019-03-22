var coordinates = []
var savedCoordinates = []
var canvas = document.querySelector('#polygon')
var ctx = canvas.getContext('2d')
var leftPosition = canvas.offsetLeft
var topPosition = canvas.offsetTop
var point

document.querySelector('#polygon').addEventListener('mousedown', e => {
  if (!savedCoordinates.length > 0) {
    return
  }
  clientX = e.clientX - leftPosition
  clientY = e.clientY - topPosition

  savedCoordinates.forEach(co => {
    co.forEach(p => {
      if (validatePoint(p, { clientX, clientY })) {
        point = p
      }
    })
  })
})

document.querySelector('#polygon').addEventListener('mousemove', e => {
  if (!point) {
    return
  }
  point.x = e.clientX - leftPosition
  point.y = e.clientY - topPosition
  drawFigures()
  drawPoints(coordinates)
  savedCoordinates.forEach(coordinates => {
    drawPoints(coordinates)
  })
})

canvas.addEventListener('mouseup', e => {
  if (point) {
    point = null
    return
  }
  var stateCoordinate = false
  clientX = e.clientX - leftPosition
  clientY = e.clientY - topPosition

  if (coordinates.length) {
    var p = coordinates[0]
    if (validatePoint(p, { clientX, clientY })) {
      if (coordinates.length == 1) {
        return
      }

      savedCoordinates.push([...coordinates])
      coordinates = []
      stateCoordinate = true
    }

    var isDuplicatePoint = coordinates.find((p, index) => {
      if (index !== 0 && validatePoint(p, { clientX, clientY })) {
        return p
      }
    })
    if (isDuplicatePoint) {
      return
    }
  }
  draw(ctx, savedCoordinates, { x: clientX, y: clientY }, stateCoordinate)
})

const validatePoint = (point, coordinates) => {
  return (
    point.x - 10 < coordinates.clientX &&
    coordinates.clientX < point.x + 10 &&
    (point.y - 10 < coordinates.clientY && coordinates.clientY < point.y + 10)
  )
}

const draw = (ctx, savedCoordinates, point, stateCoordinate) => {
  var state = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  savedCoordinates.forEach(coordinates => {
    var p = coordinates[0]
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    for (var i = 1; i < coordinates.length; i++) {
      ctx.lineTo(coordinates[i].x, coordinates[i].y)
    }
    ctx.closePath()
    if (ctx.isPointInPath(point.x, point.y) && !stateCoordinate) {
      ;(state = true), (ctx.fillStyle = 'yellow')
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.stroke()
    }

    coordinates.forEach(co => {
      drawPoint(co.x, co.y)
    })
  })

  if (stateCoordinate || state) {
    drawPoints(coordinates)
    return
  }

  coordinates.push({ x: clientX, y: clientY })
  drawPoints(coordinates)
}

const drawPoint = (x, y) => {
  ctx.beginPath()
  ctx.arc(x, y, 5, 0, 2 * Math.PI)
  ctx.stroke()
}

const drawPoints = coor => {
  coor.forEach(co => {
    drawPoint(co.x, co.y)
  })
}

const drawFigures = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  savedCoordinates.forEach(coordinates => {
    var p = coordinates[0]
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    for (var i = 1; i < coordinates.length; i++) {
      ctx.lineTo(coordinates[i].x, coordinates[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  })
}
