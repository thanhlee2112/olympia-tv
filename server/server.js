const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const GameEngine = require("./core/GameEngine")
const logger = require("./utils/logger")

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: "*" }
})

const engine = new GameEngine(io)

io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  engine.registerSocket(socket)
})

const PORT = 3000
server.listen(PORT, () => {
  logger.info(`Olympia Server running on port ${PORT}`)
})
