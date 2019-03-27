(function () {
  let coordinates = []
  let savedCoordinates = []
  let canvas = document.querySelector('#polygon')
  let point
  const radius = 5
  let isDragging = false
  let figureDragged = []
  let coordinateBeforeDragged = {}
  let firstTime = true

  document.querySelector('#polygon').addEventListener('mouseup', e => {
    isDragging = false
    firstTime = true
    point = null
  })

  document.querySelector('#polygon').addEventListener('mousemove', e => {
    const ctx = canvas.getContext('2d')
    const leftPosition = canvas.offsetLeft
    const topPosition = canvas.offsetTop
    if (!point && !isDragging) {
      return
    }

    if (isDragging) {
      const positionX = coordinateBeforeDragged.x - e.clientX
      const positionY = coordinateBeforeDragged.y - e.clientY

      let figure = [...figureDragged]

      figure.forEach(f => {
        f.x -= positionX + (firstTime ? leftPosition : 0)
        f.y -= positionY + (firstTime ? topPosition : 0)
        f['isDraggable'] = !firstTime
      })
      if (firstTime) {
        firstTime = false
      }

      figureDragged = figure
      coordinateBeforeDragged = { x: e.clientX, y: e.clientY }
    } else if (point) {
      point.x = e.clientX - leftPosition
      point.y = e.clientY - topPosition
    }
    savedCoordinates = drawAll(savedCoordinates, coordinates, ctx, canvas)
  })

  canvas.addEventListener('mousedown', e => {
    const leftPosition = canvas.offsetLeft
    const topPosition = canvas.offsetTop
    const ctx = canvas.getContext('2d')
    let isDuplicatePoint
    if (point) {
      point = null
      return
    }
    if (isDragging) {
      isDragging = false
      return
    }
    let stateCoordinate = false
    clientX = e.clientX - leftPosition
    clientY = e.clientY - topPosition

    if (coordinates.length) {
      const p = coordinates[0]
      if (validatePoint(p, { clientX, clientY }, radius)) {
        if (coordinates.length == 2) {
          return
        }
        savedCoordinates.push([...coordinates])
        coordinates = []
        stateCoordinate = true
      }

      isDuplicatePoint = coordinates.find((p, index) => {
        if (index !== 0 && validatePoint(p, { clientX, clientY }, radius)) {
          return p
        }
      })

      if (isDuplicatePoint) {
        return
      }
    }
    savedCoordinates.forEach(co => {
      co.forEach(p => {
        if (validatePoint(p, { clientX, clientY }, radius)) {
          ;(stateCoordinate = true), (point = p)
        }
      })
    })

    coordinates = draw(
      ctx,
      savedCoordinates,
      { x: clientX, y: clientY },
      stateCoordinate,
      coordinates
    )
    drawPoints(coordinates, ctx)
  })

  const drawAll = (savedCoordinates, coordinates, ctx, canvas) => {
    resetCanvas(ctx, canvas)
    savedCoordinates.forEach(coordinates => {
      drawPoints(coordinates, ctx)
    })
    drawPoints(coordinates, ctx)
    return drawFigures(ctx, savedCoordinates)
  }

  const resetCanvas = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const validatePoint = (point, coordinate, radius) => {
    const operation =
      Math.pow(coordinate.clientX - point.x, 2) +
      Math.pow(coordinate.clientY - point.y, 2)
    return operation < Math.pow(radius, 2)
  }

  const draw = (ctx, savedCoordinates, point, stateCoordinate, coordinates) => {
    let state = false
    let activeFigure
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    savedCoordinates.forEach(coordinates => {
      const p = coordinates[0]
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y)
      }
      ctx.closePath()
      if (
        ctx.isPointInPath(point.x, point.y) &&
        !stateCoordinate &&
        !activeFigure
      ) {
        ;(state = true), (move = true)
        isDragging = true
        figureDragged = coordinates
        coordinateBeforeDragged = point
        activeFigure = coordinates
        coordinates.forEach(co => {
          drawPoint(co.x, co.y, radius, ctx)
        })
        return
      } else {
        ctx.stroke()
      }

      coordinates.forEach(co => {
        drawPoint(co.x, co.y, radius, ctx)
      })
    })

    if (activeFigure) {
      drawFigure(activeFigure, ctx)
    }
    return !(stateCoordinate || state)
      ? coordinates.concat({ x: point.x, y: point.y })
      : coordinates
  }

  const drawPoint = (x, y, radius, ctx) => {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const drawFigure = (figure, ctx) => {
    const p = figure[0]
    ctx.beginPath()

    ctx.moveTo(p.x, p.y)
    for (let i = 1; i < figure.length; i++) {
      ctx.lineTo(figure[i].x, figure[i].y)
    }
    ctx.closePath()

    ctx.fillStyle = 'yellow'
    ctx.fill()
    ctx.stroke()
  }

  const drawPoints = (coor, ctx) => {
    coor.forEach(co => {
      drawPoint(co.x, co.y, radius, ctx)
    })
  }

  const drawFigures = (ctx, savedCoordinates) => {
    let isDraggableFigure
    let figureDraggable
    let figures = [...savedCoordinates]

    figures.forEach(coordinates => {
      const p = coordinates[0]
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y)
        if (coordinates[i]['isDraggable']) {
          isDraggableFigure = true
          coordinates[i]['isDraggable'] = false
        } else {
          isDraggableFigure = false
        }
      }
      ctx.closePath()
      if (isDraggableFigure) {
        figureDraggable = coordinates
        return
      }

      ctx.stroke()
    })
    if (figureDraggable) {
      drawFigure(figureDraggable, ctx)
    }
    return figures
  }

  const test = () => {
    const ctx = canvas.getContext('2d')
    for (let j = 0; j < 5; j++) {
      let coordinates = []
      for (let index = 0; index < 5; index++) {
        const x = Math.floor(Math.random() * canvas.width, 0)
        const y = Math.floor(Math.random() * canvas.height, 0)
        coordinates.push({ x, y })
      }
      savedCoordinates.push(coordinates)
    }

    draw(ctx, savedCoordinates, { x: 0, y: 0 }, false, [])
  }

  document
    .querySelector('#testButton')
    .addEventListener('click', test.bind(this))
})()
