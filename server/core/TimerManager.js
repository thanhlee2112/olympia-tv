const logger = require("../utils/logger")

class TimerManager {
  constructor(io) {
    this.io = io
    this.interval = null
  }

  start(seconds) {
    let time = seconds
    clearInterval(this.interval)

    this.interval = setInterval(() => {
      this.io.emit("timer", time)
      time--

      if (time < 0) {
        clearInterval(this.interval)
        this.io.emit("timerEnd")
        logger.info("Timer ended")
      }
    }, 1000)
  }
}

module.exports = TimerManager
