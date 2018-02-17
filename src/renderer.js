const anime = require('animejs')
const Grid = require('./grid')
const $ = require('jquery')
const fs = require('fs')
const path = require('path')

let opts
let imgnum
let grid
let movement
let images = [];

(async function main () {
  loadOptions()
  for (movement = 1; movement <= 14; movement++) {
    await nameAction(opts.movements[movement - 1])
    await initGrid()
    await loop()
    await deinitGrid()
  }
})()

async function nameAction (name) {
  try {
    let nameElement = $(`<h1 class='title'>${name}</h1>`)
    $('#screen').append(nameElement)

    // Wrap every letter in a span
    $('.title').each(function () {
      $(this).html($(this).text().replace(/(\w)/g, "<span class='letter'>$&</span>"))
    })

    await anime({
      targets: '.title .letter',
      opacity: [0, 1],
      easing: 'easeInOutQuad',
      duration: 2250,
      delay: function (el, i) {
        return 150 * (i + 1)
      }
    }).finished
    await anime({
      targets: '.title',
      opacity: 0,
      duration: 1000,
      easing: 'easeOutExpo',
      delay: 1000
    }).finished
  } catch (e) {
    console.log(e)
  }
}

async function loadOptions () {
  opts = JSON.parse(fs.readFileSync(`${process.resourcesPath}/app/options.json`))
  console.log(opts)
  opts.movements.forEach((m, i) => {
    images.push([])
    fs.readdirSync(`${process.resourcesPath}/app/img/${i+1}`).forEach(img => {
      if (path.extname(img) === '.jpg' && path.basename(img)[0] !== '.') {
        images[i].push(`img/${i+1}/${img}`)
      }
    })
  })
  console.log(images)
}

function makeSquare (row, col, roff = 0, coff = 0, scale = 1) {
  let num = imgnum++
  for (let r = 0; r < scale; r++) {
    for (let c = 0; c < scale; c++) {
      grid.grid[row + r][col + c] = num
    }
  }

  let block = $(`<div class='block col${col} row${row}'>`)
  block.css({
    'width': `${opts.size * scale}vh`,
    'height': `${opts.size * scale}vh`,
    'left': `${opts.size * (col + coff)}vh`,
    'top': `${opts.size * (row + roff)}vh`,
    'z-index': scale
  })

  // creates and formats inner image
  let image = $('<div class="image">')
  image.css({
    'background': opts.gridColor,
    'background-image': `url(${images[movement][imgnum % images[movement].length]})`,
    'background-position': `${anime.random(0, 80)}% ${anime.random(0, 80)}%`
  })

  return block.append(image)
}

async function initGrid () {
  imgnum = 0
  grid = new Grid(3, 4)
  $('#screen').css('opacity', 0)
  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      $('#screen').append(makeSquare(r, c))
    }
  }
  await anime({
    targets: '#screen',
    opacity: 1,
    duration: 4000,
    easing: 'easeInOutQuad'
  }).finished
}

async function deinitGrid () {
  await fadeOut()
  $('#screen').empty()
}

async function fadeOut () {
  await anime({
    targets: '.block',
    opacity: 0,
    duration: 2000,
    easing: 'easeInOutQuad'
  }).finished
}

function createCol (cols, direction) {
  let big = true
  cols.forEach(col => grid.col(col, []))
  cols.forEach(col => {
    for (let row = 0; row < 3; row++) {
      if (!grid.grid[row][col]) {
        if (big && anime.random(0, 2) === 0 && row < 2 && col < cols[cols.length - 1]) {
          big = false
          $('#screen').append(makeSquare(row, col, -direction * opts.rows, 0, 2))
        } else if (big && anime.random(0, 1) === 0 && cols.length > 2 && row === 0 && col < 2) {
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
  rows.forEach(row => grid.row(row, []))
  rows.forEach(row => {
    for (let col = 0; col < 4; col++) {
      if (!grid.grid[row][col]) {
        if (big && anime.random(0, 2) === 0 && row < rows[rows.length - 1] && col < opts.cols - 1) {
          big = false
          $('#screen').append(makeSquare(row, col, 0, -direction * opts.cols, 2))
        } else if (big && anime.random(0, 1) === 0 && rows.length > 2 && row === 0 && col < 2) {
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
      translateY: `+= ${dir * opts.rows * opts.size}vh`,
      duration: 2000,
      easing: 'easeInOutQuad'
    }).finished
    await delay(2000)
    old.forEach(e => e.remove())
  } catch (error) {
    console.log(error)
  }
}

async function rowAction (rows, dir) {
  try {
    let classes = Array.from(new Set(rows.map(x => '.row' + x)))
    var old = $(classes.join(', ')).toArray()
    createRow(rows, dir)
    await anime({
      targets: classes,
      translateX: `+= ${dir * opts.cols * opts.size}vh`,
      translateY: '+=0',
      duration: 2000,
      easing: 'easeInOutQuad'
    }).finished
    await delay(2000)
    old.forEach(e => e.remove())
  } catch (error) {
    console.log(error)
  }
}

function range (start, end, step = 1) {
  let r = []
  for (let i = start; i < end; i += step) r.push(i)
  return r
}

async function randColAction () {
  let dir = 2 * anime.random(0, 1) - 1
  let num = anime.random(3, opts.cols - 1)
  let col = anime.random(0, opts.cols - num)
  let all = range(col, col + num)
  all.slice(0).forEach(c => {
    all.push(...grid.lockedCols(c))
  })
  all = Array.from(new Set(all))
  await colAction(all, dir)
}

async function randRowAction () {
  let dir = 2 * anime.random(0, 1) - 1
  let num = anime.random(2, opts.rows - 1)
  let row = anime.random(0, opts.rows - num)
  let all = range(row, row + num)
  all.slice(0).forEach(r => {
    all.push(...grid.lockedRows(r))
  })
  all = Array.from(new Set(all))
  await rowAction(all, dir)
}

async function randAction () {
  switch (anime.random(0, 1)) {
    case 0:
      await randColAction()
      // await fadeAction()
      console.log(grid.grid)
      break
    case 1:
      await randRowAction()
      // await fadeAction()
      console.log(grid.grid)
      break
  }
}

async function loop () {
  try {
    let animate = true
    $(document).keypress(() => {
      animate = false
    })
    while (animate) await randAction()
  } catch (e) {}
}
