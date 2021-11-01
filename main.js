import * as d3 from 'd3'

const config = {
  maxWidth: 960,
  maxHeight: 600,
  maxLineWidth: 7,
  nLines: 30,
  nCoords: 30,
  totalTime: 1000,
  ease: d3.easeSinInOut,
}

const rand = (min, max) => Math.random() * (max - min) + min

const getTotalLength = (coords, lineGen) => {
  const svg = d3.select('body').append('svg')
  const length = svg
    .attr('display', 'none')
    .append('path')
    .attr('d', lineGen(coords))
    .node()
    .getTotalLength()
  svg.remove()
  return length
}

const getColors = d3.interpolateRgbBasis(['red', 'blue', 'white'])

const draw = () => {
  const canvas = d3
    .select('#app')
    .append('canvas')
    .attr('id', 'linesCanvas')
    .attr('width', config.maxWidth)
    .attr('height', config.maxHeight)
  const context = canvas.node().getContext('2d')

  const coords = Array(config.nCoords)
    .fill(0)
    .map(() => ({x: rand(0, config.maxWidth), y: rand(0, config.maxHeight)}))

  const lineGenerator = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
  const totalLength = getTotalLength(coords, lineGenerator)
  const lineWidths = Array(config.nLines)
    .fill(0)
    .map((_) => rand(0, config.maxLineWidth))

  context.setLineDash([totalLength, totalLength])
  context.globalAlpha = 0.3

  // const interpolator = d3.interpolate(0, 1)
  const drawFrame = (elapsed, totalTime) => {
    context.clearRect(0, 0, config.maxWidth, config.maxHeight)
    for (let i = 0; i < config.nLines; i++) {
      context.beginPath()
      lineGenerator
        .context(context)
        .curve(d3.curveBundle.beta(config.ease(i / config.nLines) * 0.7 + 0.3))(
        coords,
      )
      const dashOffset = config.ease(1 - elapsed / totalTime) * totalLength
      if (dashOffset > 0) context.lineDashOffset = dashOffset
      context.strokeStyle = getColors(i / config.nLines)
      context.lineWidth = lineWidths[i]
      context.stroke()
      context.closePath()
    }
  }

  const timer = d3.timer((elapsed) => {
    drawFrame(elapsed, config.totalTime)
    if (elapsed > config.totalTime) timer.stop()
  })
}
draw()

export default draw
