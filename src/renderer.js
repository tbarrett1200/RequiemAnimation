const anime = require('animejs')
const $ = require('jquery')
const fs = require('fs')

let opts
let imgnum = 0
let grid = [[], [], []]

function getRow (r) {
  if (r > 2) console.log('overflow error')
  return grid[r]
}

function getCol (c) {
  if (c > 3) console.log('overflow error')
  return [grid[0][c], grid[1][c], grid[2][c]]
}

function setRow (r, row) {
  grid[r] = row
}

function setCol (c, col) {
  grid[0][c] = col[0]
  grid[1][c] = col[1]
  grid[2][c] = col[2]
}

function getRowsWith (e) {
  let rows = []
  for (let r = 0; r < 3; r++) {
    if (getRow(r).indexOf(e) !== -1) rows.push(r)
  }
  return rows
}

function getColsWith (e) {
  let cols = []
  for (let c = 0; c < 4; c++) {
    if (getCol(c).indexOf(e) !== -1) cols.push(c)
  }
  return cols
}

function getLockedRows (r) {
  let rows = new Set()
  getRow(r).forEach(e => {
    getRowsWith(e).forEach(r => rows.add(r))
  })
  return Array.from(rows)
}

function getLockedCols (c) {
  let cols = new Set()
  getCol(c).forEach(e => {
    getColsWith(e).forEach(r => cols.add(r))
  })
  return Array.from(cols)
}

(function main () {
  loadOptions()
  initializeGrid()
  loop()
})()

function loadOptions () {
  opts = JSON.parse(fs.readFileSync('options.json'))
}

function makeSquare (row, col, roff = 0, coff = 0, scale = 1) {
  let num = imgnum++
  for (let r = 0; r < scale; r++) {
    for (let c = 0; c < scale; c++) {
      grid[row + r][col + c] = num
    }
  }

  let block = $(`<div class='block col${col} row${row}'>`)
  block.css({
    'width': `${opts.size * scale}px`,
    'height': `${opts.size * scale}px`,
    'left': `${opts.size * (col + coff)}px`,
    'top': `${opts.size * (row + roff)}px`,
    'z-index': scale
  })

  // creates and formats inner image
  let image = $('<div class="image">')
  image.css({
    'background': opts.gridColor,
    'background-image': `url("img/${imgnum % 11}.jpg")`,
    'background-position': `${anime.random(0, 80)}% ${anime.random(0, 80)}%`
  })

  return block.append(image)
}

function initializeGrid () {
  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      $('#screen').append(makeSquare(r, c))
    }
  }
}

function createCol (cols, direction) {
  let big = true
  cols.forEach(col => setCol(col, []))
  cols.forEach(col => {
    for (let row = 0; row < 3; row++) {
      if (!grid[row][col]) {
        if (big && anime.random(0, 1) === 0 && row < 2 && col < cols[cols.length - 1]) {
          big = false
          $('#screen').append(makeSquare(row, col, -direction * opts.rows, 0, 2))
        } else if (big && anime.random(0, 1) === 0 && row < 1 && col < cols[cols.length - 2]) {
          big = false
          $('#screen').append(makeSquare(row, col, -direction * opts.rows, 0, 3))
        } else {
          $('#screen').append(makeSquare(row, col, -direction * opts.rows, 0))
        }
      }
    }
  })
}

function createRow (rows, direction) {
  let big = true
  rows.forEach(row => setRow(row, []))
  rows.forEach(row => {
    for (let col = 0; col < 4; col++) {
      if (!grid[row][col]) {
        if (big && anime.random(0, 1) === 0 && row < rows[rows.length - 1] && col < opts.cols - 1) {
          big = false
          $('#screen').append(makeSquare(row, col, 0, -direction * opts.cols, 2))
        } else if (big && anime.random(0, 1) === 0 && row < rows[rows.length - 2] && col < opts.cols - 2) {
          big = false
          $('#screen').append(makeSquare(row, col, 0, -direction * opts.cols, 2))
        } else {
          $('#screen').append(makeSquare(row, col, 0, -direction * opts.cols))
        }
      }
    }
  })
}

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}

async function colAction (cols, dir) {
  try {
    let classes = Array.from(new Set(cols.map(x => '.col' + x)))
    let old = $(classes.join(', ')).toArray()
    createCol(cols, dir)
    await anime({
      targets: classes,
      translateX: '+=0',
      translateY: '+=' + dir * opts.rows * opts.size,
      duration: 2000,
      easing: 'easeInOutQuad'
    }).finished
    await delay(1000)
    old.forEach(e => e.remove())
  } catch (error) {}
}

async function rowAction (rows, dir) {
  try {
    let classes = Array.from(new Set(rows.map(x => '.row' + x)))
    var old = $(classes.join(', ')).toArray()
    createRow(rows, dir)
    await anime({
      targets: classes,
      translateX: '+=' + dir * opts.cols * opts.size,
      translateY: '+=0',
      duration: 2000,
      easing: 'easeInOutQuad'
    }).finished
    await delay(1000)
    old.forEach(e => e.remove())
  } catch (error) {}
}

async function fadeAction () {
  try {
    let toBeAnimated = []
    let childs = Array.from($('#screen').children().children())
    for (let i = 0; i < childs.length; i++) {
      if (anime.random(0, 4) === 0) {
        toBeAnimated.push(childs[i])
      }
    }
    await anime({
      targets: toBeAnimated,
      opacity: 0,
      duration: 1000,
      easing: 'easeInOutQuad'
    }).finished
    toBeAnimated.forEach(e => {
      e.style['background-image'] = `url("img/${++imgnum % 11}.jpg")`
      e.style['background-position'] = `${anime.random(0, 80)}% ${anime.random(0, 80)}%`
    })
    await anime({
      targets: toBeAnimated,
      opacity: 1,
      duration: 1000,
      easing: 'easeInOutQuad'
    }).finished
  } catch (error) {}
}

function range (start, end, step = 1) {
  let r = []
  for (let i = start; i < end; i += step) r.push(i)
  return r
}

async function randColAction () {
  let dir = 2 * anime.random(0, 1) - 1
  let num = anime.random(1, opts.cols - 1)
  let col = anime.random(0, opts.cols - num)
  let all = range(col, col + num)
  all.slice(0).forEach(c => {
    all.push(...getLockedCols(c))
  })
  all = Array.from(new Set(all))
  await colAction(all, dir)
}

async function randRowAction () {
  let dir = 2 * anime.random(0, 1) - 1
  let num = anime.random(1, opts.rows - 1)
  let row = anime.random(0, opts.rows - num)
  let all = range(row, row + num)
  all.slice(0).forEach(r => {
    all.push(...getLockedRows(r))
  })
  all = Array.from(new Set(all))
  await rowAction(all, dir)
}

async function randAction () {
  switch (anime.random(0, 1)) {
    case 0:
      await randColAction()
      await fadeAction()
      break
    case 1:
      await randRowAction()
      await fadeAction()
      break
  }
}

async function loop () {
  try {
    while (true) await randAction()
  } catch (e) {}
}
