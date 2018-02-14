class Grid {
  constructor (rows, cols) {
    this.rows = rows
    this.cols = cols
    this.grid = [...new Array(rows)].map(x => [])
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
    return [...Array(this.rows).keys()].map(i => {
      return this.row(i).indexOf(e) !== -1 ? i : false
    }).filter(b => b !== false)
  }

  colsWith (e) {
    return [...Array(this.cols).keys()].map(i => {
      return this.col(i).indexOf(e) !== -1 ? i : false
    }).filter(b => b !== false)
  }

  lockedRows (r) {
    let rows = new Set()
    this.row(r).forEach(e => {
      this.rowsWith(e).forEach(r => rows.add(r))
    })
    return Array.from(rows).sort()
  }

  lockedCols (c) {
    let cols = new Set()
    this.col(c).forEach(e => {
      this.colsWith(e).forEach(r => cols.add(r))
    })
    return Array.from(cols).sort()
  }
}

module.exports = Grid
