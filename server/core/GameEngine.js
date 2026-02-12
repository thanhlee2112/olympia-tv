const ScoreManager = require("./ScoreManager")
const TimerManager = require("./TimerManager")
const BuzzerManager = require("./BuzzerManager")
const questions = require("../data/questions.json")
const db = require("../database/db")
const logger = require("../utils/logger")
const { PHASES } = require("../config/constants")

class GameEngine {
  constructor(io) {
    this.io = io
    this.phase = PHASES[0]
    this.currentQuestionIndex = 0

    this.scoreManager = new ScoreManager(io)
    this.timerManager = new TimerManager(io)
    this.buzzerManager = new BuzzerManager(io)

    this.players = []
  }

  registerSocket(socket) {

    socket.on("join", ({ name }) => {
      if (!this.players.includes(name)) {
        this.players.push(name)
        this.scoreManager.addPlayer(name)
        this.broadcastState()
      }
    })

    socket.on("changePhase", (phase) => {
      if (PHASES.includes(phase)) {
        this.phase = phase
        this.currentQuestionIndex = 0
        this.buzzerManager.reset()
        this.broadcastState()
      }
    })

    socket.on("startTimer", (seconds) => {
      this.timerManager.start(seconds)
    })

    socket.on("buzz", ({ name }) => {
      this.buzzerManager.handleBuzz(name)
    })

    socket.on("submitAnswer", ({ name, answer }) => {
      this.handleAnswer(name, answer)
    })

    socket.on("updateScore", ({ name, delta }) => {
      this.scoreManager.updateScore(name, delta)
    })
  }

  handleAnswer(name, answer) {
    const correct =
      questions[this.phase][this.currentQuestionIndex]?.answer

    if (!correct) return

    const isCorrect =
      answer.trim().toLowerCase() === correct.toLowerCase()

    if (isCorrect) {
      this.scoreManager.updateScore(name, 10)
    } else {
      this.scoreManager.updateScore(name, -5)
    }

    this.buzzerManager.reset()
  }

  broadcastState() {
    this.io.emit("gameState", {
      phase: this.phase,
      question:
        questions[this.phase][this.currentQuestionIndex],
      scores: this.scoreManager.getScores(),
      players: this.players
    })
  }
}

module.exports = GameEngine
