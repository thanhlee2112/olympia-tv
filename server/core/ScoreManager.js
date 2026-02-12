const db = require("../database/db")

class ScoreManager {
  constructor(io) {
    this.io = io
    this.scores = {}
  }

  addPlayer(name) {
    this.scores[name] = 0
    this.broadcast()
  }

  updateScore(name, delta) {
    if (!this.scores[name]) this.scores[name] = 0
    this.scores[name] += delta

    db.saveScore(name, this.scores[name])
    this.broadcast()
  }

  broadcast() {
    this.io.emit("scores", this.scores)
  }

  getScores() {
    return this.scores
  }
}

module.exports = ScoreManager
