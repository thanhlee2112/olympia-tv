const { BUZZER_TIME } = require("../config/constants")

class BuzzerManager {
  constructor(io) {
    this.io = io
    this.locked = false
  }

  handleBuzz(name) {
    if (this.locked) return

    this.locked = true
    this.io.emit("buzzed", name)

    setTimeout(() => {
      this.reset()
    }, BUZZER_TIME * 1000)
  }

  reset() {
    this.locked = false
    this.io.emit("buzzReset")
  }
}

module.exports = BuzzerManager
