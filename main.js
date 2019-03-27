;(function () {
  let state = {
    coordinates: [],
    savedCoordinates: [],
    canvas: document.querySelector('#polygon'),
    point: {},
    isDragging: false,
    figureDragged: [],
    coordinateBeforeDragged: {},
    firstTime: true
  }
  document.querySelector('#polygon').addEventListener('mouseup', e => {
    state.isDragging = false
    state.firstTime = true
    state.point = null
  })

  document.querySelector('#polygon').addEventListener('mousemove', e => {
    const radius = 5
    const ctx = state.canvas.getContext('2d')
    const leftPosition = state.canvas.offsetLeft
    const topPosition = state.canvas.offsetTop
    if (!state.point && !state.isDragging) {
      return
    }

    if (state.isDragging) {
      const positionX = state.coordinateBeforeDragged.x - e.clientX
      const positionY = state.coordinateBeforeDragged.y - e.clientY

      let figure = [...state.figureDragged]

      figure.forEach(f => {
        f.x -= positionX + (state.firstTime ? leftPosition : 0)
        f.y -= positionY + (state.firstTime ? topPosition : 0)
        f['isDraggable'] = !state.firstTime
      })
      if (state.firstTime) {
        state.firstTime = false
      }

      state.figureDragged = figure
      state.coordinateBeforeDragged = { x: e.clientX, y: e.clientY }
    } else if (state.point) {
      state.point.x = e.clientX - leftPosition
      state.point.y = e.clientY - topPosition
    }
    state.savedCoordinates = drawAll(
      state.savedCoordinates,
      state.coordinates,
      ctx,
      state.canvas,
      radius
    )
  })

  document.querySelector('#polygon').addEventListener('mousedown', e => {
    const radius = 5
    const leftPosition = state.canvas.offsetLeft
    const topPosition = state.canvas.offsetTop
    const ctx = state.canvas.getContext('2d')
    let isDuplicatePoint
    let stateCoordinate = false
    const clientX = e.clientX - leftPosition
    const clientY = e.clientY - topPosition

    if (state.point || state.isDragging) {
      state.point = null
      state.isDragging = false
      return
    }

    if (state.coordinates.length) {
      const p = state.coordinates[0]
      if (validatePoint(p, { clientX, clientY }, radius)) {
        if (state.coordinates.length == 2) {
          return
        }
        state.savedCoordinates.push([...state.coordinates])
        state.coordinates = []
        stateCoordinate = true
      }

      isDuplicatePoint = state.coordinates.find((p, index) => {
        if (index !== 0 && validatePoint(p, { clientX, clientY }, radius)) {
          return p
        }
      })

      if (isDuplicatePoint) {
        return
      }
    }
    state.savedCoordinates.forEach(co => {
      co.forEach(p => {
        if (validatePoint(p, { clientX, clientY }, radius)) {
          ;(stateCoordinate = true), (point = p)
        }
      })
    })

    state.coordinates = draw(
      ctx,
      state.savedCoordinates,
      { x: clientX, y: clientY },
      stateCoordinate,
      state.coordinates,
      radius
    )
    drawPoints(state.coordinates, ctx, radius)
  })

  const drawAll = (savedCoordinates, coordinates, ctx, canvas, radius) => {
    resetCanvas(ctx, canvas)
    savedCoordinates.forEach(coordinates => {
      drawPoints(coordinates, ctx, radius)
    })
    drawPoints(coordinates, ctx, radius)
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

  const draw = (
    ctx,
    savedCoordinates,
    point,
    stateCoordinate,
    coordinates,
    radius
  ) => {
    let stateFigure = false
    let activeFigure
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)

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
        ;(stateFigure = true), (move = true)
        state.isDragging = true
        state.figureDragged = coordinates
        state.coordinateBeforeDragged = point
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
    return !(stateCoordinate || stateFigure)
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

  const drawPoints = (coor, ctx, radius) => {
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
