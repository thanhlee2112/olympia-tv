const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let gameState = {
  question: null,
  locked: false,
  correctAnswer: null,
  timeLeft: 100
}

io.on("connection", (socket) => {

  socket.emit("state:update", gameState)

  socket.on("mc:newQuestion", (q) => {
    gameState.question = q
    gameState.locked = false
    gameState.correctAnswer = null
    gameState.timeLeft = 100
    io.emit("state:update", gameState)
  })

  socket.on("contestant:answer", (answer) => {
    console.log("Contestant chose:", answer)
  })

  socket.on("mc:lock", () => {
    gameState.locked = true
    io.emit("state:update", gameState)
  })

  socket.on("mc:reveal", (correct) => {
    gameState.correctAnswer = correct
    io.emit("state:update", gameState)
  })
})

server.listen(4000, () => {
  console.log("Offline Server running on 4000")
})
