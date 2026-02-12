const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")
const app = express()
const server = http.createServer(app)
const kickoffQuestionBank = require("./data/questions/kickoff.json")
const { v4: uuidv4 } = require("uuid")
const { emit } = require("process")
const io = new Server(server, {
  cors: { origin: "*" }
})

/* ======================
   GAME STATE
====================== */

let gameState = {
  phase: "dashboard",
  currentPlayer: null,
  timer: 60,
  kickoff: {
    questions: [],
    currentIndex: 0,
    running: false,
    questionVisible: false
  },
  obstacle: null,
  speedup: null,
  players: null
}

gameState.players = [
  { id: "1", name: "Player 1", score: 0, token: uuidv4(), socketId: null },
  { id: "2", name: "Player 2", score: 0, token: uuidv4(), socketId: null },
  { id: "3", name: "Player 3", score: 0, token: uuidv4(), socketId: null },
]
gameState.players.forEach(player => {
  console.log(
    `${player.name}: http://10.16.31.80:5174/?token=${player.token}`
  )
})
gameState.obstacle = {
  keyword: "CONSONG",
  rowAnswers:{
      1: null,
      2: null,
      3: null,
      4: null
  },
  rows: [
    {
      id: 1,
      question: "Hàng ngang 1?",
      answer: "SONG",
      revealed: false,
      disabled: false
    },
    {
      id: 2,
      question: "Hàng ngang 2?",
      answer: "NUOC",
      revealed: false,
      disabled: false
    },
    {
      id: 3,
      question: "Hàng ngang 3?",
      answer: "BIEN",
      revealed: false,
      disabled: false
    },
    {
      id: 4,
      question: "Hàng ngang 4?",
      answer: "HO",
      revealed: false,
      disabled: false
    }
  ],

  image: {
    parts: [
      { id: 1, revealed: false },
      { id: 2, revealed: false },
      { id: 3, revealed: false },
      { id: 4, revealed: false }
    ],
    center: {
      revealed: false,
      question: "Câu hỏi ô trung tâm?",
      answer: "VIETNAM"
    }
  },
  currentRow: null,
  timer: 0,
  obstacleClear: false,
  acceptingAnswer: false,
  buzzPlayer: null,
  lockedPlayers: []
}
gameState.speedup =  
{
    questions: [
      { id: 1, text: "Câu hỏi 1?", answer: "A" },
      { id: 2, text: "Câu hỏi 2?", answer: "B" },
      { id: 3, text: "Câu hỏi 3?", answer: "C" },
      { id: 4, text: "Câu hỏi 4?", answer: "D" }
    ],
    currentQuestion: null,
    timer: 0,
    running: false,
    locked: false,
    answers: {},
    correctPlayers: []
}
let timerInterval = null

/* ======================
   SOCKET
====================== */
io.use((socket, next) => {
  const { role, token } = socket.handshake.auth

  // MC không cần token
  if (role === "mc") {
    socket.role = "mc"
    return next()
  }

  // Public không cần token
  if (role === "public") {
    socket.role = "public"
    return next()
  }

  // Player bắt buộc phải có token
  if (role === "player") {
    if (!token) {
      return next(new Error("No token"))
    }

    const player = gameState.players.find(p => p.token === token)

    if (!player) {
      return next(new Error("Invalid token"))
    }

    // Đá socket cũ nếu có
    if (player.socketId) {
      const oldSocket = io.sockets.sockets.get(player.socketId)
      if (oldSocket) oldSocket.disconnect(true)
    }

    player.socketId = socket.id
    socket.playerId = player.id
    socket.role = "player"

    return next()
  }

  next(new Error("Unknown role"))
})


io.on("connection", (socket) => {
  console.log("Player connected:", socket.playerId)

  socket.join("player-" + socket.playerId)

  socket.on("disconnect", () => {
    const player = gameState.players.find(
      p => p.id === socket.playerId
    )
    if (player) {
      player.socketId = null
    }
  })
  emitState()
  if (socket.role === "player") {
    socket.emit("player:info", {
      id: socket.playerId
    })
  }
  socket.on("mc:setPhase", (phase) => {
    if (socket.role !== "mc") return
    gameState.phase = phase
emitState()
  })
socket.on("player:answerRow", (answer) => {
  const rowId = gameState.obstacle.currentRow
  if (!rowId) return
  if (!gameState.obstacle.acceptingAnswer) return

  if (!gameState.obstacle.rowAnswers[rowId]) {
    gameState.obstacle.rowAnswers[rowId] = {}
  }

  gameState.obstacle.rowAnswers[rowId][socket.playerId] = answer

  emitState()
})
socket.on("mc:addRowScore", ({ playerId }) => {
  const rowId = gameState.obstacle.currentRow
  if (!rowId) return

  const player = gameState.players.find(p => p.id === playerId)
  if (!player) return

  player.score += 10

  emitState()
})

  socket.on("mc:startKickoff", ({ playerId }) => {
    gameState.phase = "KhoiDong"
    gameState.currentPlayer = playerId
    gameState.timer = 60
        
    gameState.kickoff = {
      questions: kickoffQuestionBank[playerId],
      currentIndex: 0,
      running: true,
      questionVisible: false
    }


emitState()
})
socket.on("mc:showQuestion", () => {
  if (!gameState.kickoff.running) return

  gameState.kickoff.questionVisible = true
  startTimer()
emitState()
})
socket.on("mc:selectSpeedQuestion", (id) => {
  gameState.speedup.currentQuestion =
    gameState.speedup.questions.find(q => q.id === id)
  gameState.speedup.timer = 0
  gameState.speedup.running = false
  gameState.speedup.locked = false
  gameState.speedup.answers = {}
  gameState.speedup.correctPlayers = []
  emitState()
})

socket.on("mc:startSpeedTimer", () => {
  if (!gameState.speedup.currentQuestion) return
  gameState.speedup.running = true
  gameState.speedup.timer = 0
  gameState.speedup.locked = false
  const interval = setInterval(() => {
    gameState.speedup.timer += 0.01
    gameState.speedup.timer =
      Number(gameState.speedup.timer.toFixed(2))
    if (gameState.speedup.timer >= 30) {
      clearInterval(interval)
      gameState.speedup.running = false
      gameState.speedup.locked = true
    }
    emitState()
  }, 10)
})
  socket.on("player:speedAnswer", (answer) => {
    if (!gameState.speedup.running) return

    gameState.speedup.answers[socket.id] = {
      answer,
      time: gameState.speedup.timer
    }

    emitState()
  })

  socket.on("mc:markSpeedCorrect", (playerId) => {
    if (!gameState.speedup.correctPlayers.includes(playerId)) {
      gameState.speedup.correctPlayers.push(playerId)
    }
    emitState()
  })

  socket.on("mc:unmarkSpeedCorrect", (playerId) => {
    gameState.speedup.correctPlayers =
      gameState.speedup.correctPlayers.filter(id => id !== playerId)
    emitState()
  })

  socket.on("mc:confirmSpeedScore", () => {
    const { answers, correctPlayers } = gameState.speedup

    const sorted = correctPlayers
      .map(id => ({
        id,
        time: answers[id]?.time ?? 999
      }))
      .sort((a, b) => a.time - b.time)

    sorted.forEach((p, index) => {
      const player = gameState.players.find(pl => pl.id === p.id)
      if (!player) return

      if (index === 0) player.score += 40
      else if (index === 1) player.score += 30
      else if (index === 2) player.score += 20
      else if (index === 3) player.score += 10
    })

    gameState.speedup.locked = true
    emitState()
  })
socket.on("mc:answer", (correct) => {

  if (!gameState.kickoff.running) return

  if (correct) {
    const player = gameState.players.find(
      p => p.id === gameState.currentPlayer
    )
    player.score += 10
  }

  gameState.kickoff.currentIndex++

  if (gameState.kickoff.currentIndex >= 12) {
    endKickoff()
  }

emitState()
})
socket.on("mc:selectRow", (rowId) => {
  if (socket.role !== "mc") return

  const row = gameState.obstacle.rows.find(r => r.id === rowId)
  if (!row || row.disabled) return

  gameState.obstacle.currentRow = rowId
  gameState.obstacle.timer = 15
  gameState.obstacle.acceptingAnswer = false

  emitState()
})
socket.on("mc:startRowTimer", () => {
  if (socket.role !== "mc") return

  gameState.obstacle.acceptingAnswer = true

  const interval = setInterval(() => {
    gameState.obstacle.timer--

    if (gameState.obstacle.timer <= 0) {
      clearInterval(interval)
      gameState.obstacle.acceptingAnswer = false
    }

    emitState()
  }, 1000)
})
socket.on("mc:rowResult", (correct) => {
  if (socket.role !== "mc") return

  const row = gameState.obstacle.rows.find(
    r => r.id === gameState.obstacle.currentRow
  )

  if (!row) return

  if (correct) {
    row.revealed = true
    gameState.obstacle.image.parts[row.id - 1].revealed = true
  } else {
    row.disabled = true
  }

  gameState.obstacle.currentRow = null
  emitState()
})
socket.on("player:buzzObstacle", () => {
  if (gameState.obstacle.buzzPlayer) return
  if (gameState.obstacle.lockedPlayers.includes(socket.playerId)) return

  gameState.obstacle.buzzPlayer = socket.playerId
  emitState()
})
socket.on("mc:obstacleResult", (correct) => {
  const playerId = gameState.obstacle.buzzPlayer
  const player = gameState.players.find(p => p.id === playerId)

  if (!player) return

  if (correct) {
    const revealedCount =
      gameState.obstacle.rows.filter(r => r.revealed).length
    gameState.obstacle.obstacleClear = true
    const scoreMap = { 0:80, 1: 80, 2: 60, 3: 40, 4: 20 }
    const score = scoreMap[revealedCount] || 0

    player.score += score
    gameState.obstacle.rows.forEach((r)=>{
      r.revealed = true
      r.disabled = false
    })
    gameState.obstacle.image.parts.forEach((i)=>{
      i.revealed = true
    })
    gameState.obstacle.image.center.revealed = true
  } else {
    gameState.obstacle.lockedPlayers.push(playerId)
  }

  gameState.obstacle.buzzPlayer = null
  emitState()
})
socket.on("mc:selectCenter", () => {
  if (!gameState.obstacle.rows.every(r => r.revealed || r.disabled)) return

  gameState.obstacle.centerSelected = true
  emitState()
})

socket.on("mc:centerResult", (correct) => {
  const playerId = gameState.obstacle.buzzPlayer
  const player = gameState.players.find(p => p.id === playerId)

  if (!player) return

  if (correct) {
    player.score += 10
    gameState.obstacle.image.center.revealed = true
  }

  gameState.obstacle.buzzPlayer = null
  emitState()
})

})
function emitState() {
  io.sockets.sockets.forEach((s) => {
    if (s.role === "player") {
      if(gameState.phase === "KhoiDong") {
        s.emit("state:update", buildKickoffPlayerState(s))
      } else if(gameState.phase === "ChuongNgaiVat") {
        s.emit("state:update", buildObstaclePlayerState(s))
      }else{
        s.emit("state:update", buildPlayerState(s))
      }
    } else {
      s.emit("state:update", gameState) // MC nhận full
    }
  })
}

function buildPlayerState(socket) {
  const player = gameState.players.find(
    p => p.id === socket.playerId
  )

  return {
    phase: gameState.phase,
    name: player?.name || "Unknown",
    score: player?.score || 0
  }
}

function buildKickoffPlayerState(socket) {
  const player = gameState.players.find(
    p => p.id === socket.playerId
  )

  let currentQuestion = null

  if (
    gameState.phase === "KhoiDong" &&
    gameState.currentPlayer === socket.playerId &&
    gameState.kickoff.questionVisible
  ) {
    const q =
      gameState.kickoff.questions[
        gameState.kickoff.currentIndex
      ]

    if (q) {
      currentQuestion = {
        number: q.number,
        question: q.question
      }
    }
  }

  return {
    phase: gameState.phase,
    timer: gameState.timer,
    name: player?.name || "Unknown",
    isActive:
      gameState.currentPlayer === socket.playerId,
    score: player?.score || 0,
    currentQuestion
  }
}

function startTimer() {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    gameState.timer--

    if (gameState.timer <= 0) {
      endKickoff()
    }

emitState()
  }, 1000)
}
function buildObstaclePlayerState(socket) {
  const player = gameState.players.find(
    p => p.id === socket.playerId
  )

  return {
    phase: gameState.phase,
    score: player?.score || 0,
    currentRow: gameState.obstacle.currentRow,
    rows: gameState.obstacle.rows.map(r => ({
      id: r.id,
      revealed: r.revealed,
      disabled: r.disabled,
      question: r.question,
      answer: r.revealed ? r.answer : null,
      numberOfChars: r.answer.length
    })),

    image: gameState.obstacle.image,

    timer: gameState.obstacle.timer,
    buzzPlayer: gameState.obstacle.buzzPlayer,
    locked: gameState.obstacle.lockedPlayers.includes(socket.playerId)
  }
}

function endKickoff() {
  clearInterval(timerInterval)
  gameState.kickoff.running = false
  gameState.currentPlayer = null
emitState()}
const PORT = 3000

app.use("/player", express.static(path.join(__dirname, "../player-client/dist")))
app.use("/public", express.static(path.join(__dirname, "../public-screen/dist")))
app.use("/control", express.static(path.join(__dirname, "../control-panel/dist")))
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT)
})
