class Grid {
  constructor (rows, cols) {
    this.grid = [...Array(rows)].map(x => [])
  }

  row (r, val) {
    if (val === undefined) return this.grid[r]
    else this.grid[r] = val
  }

  col (c, val) {
    if (val === undefined) return this.grid.map(r => r[c])
    else {
      this.grid.map((row, i) => {
        row[c] = val[i]
        return row
      })
    }
  }

  rowsWith (e) {
    return this.grid.map((row, i) => row.indexOf(e) !== -1 ? i : false).filter(b => b !== false)
  }
}

module.exports = Grid

let grid = new Grid(3, 4)
grid.row(0, [1, 0, 3, 4])
grid.row(1, [1, 1, 3, 4])
grid.row(2, [2, 2, 3, 4])
console.log(grid.rowsWith(3))
