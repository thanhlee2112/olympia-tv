const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")
const app = express()
const server = http.createServer(app)
const kickoffQuestionBank = require("./data/questions/kickoff-2.json")
const { v4: uuidv4 } = require("uuid")
const { emit } = require("process")
const { buzz } = require("../player-client/src/socket")
const io = new Server(server, {
  cors: { origin: "*" }
})

/* ======================
   GAME STATE
====================== */
const SPEED_DURATION = 30000
const fs = require('fs');

const finalQuestionBank = require("./data/questions/final.json");

// Khởi tạo bản sao sạch
let allQuestions = JSON.parse(JSON.stringify(finalQuestionBank));
console.log(`Tổng số câu hỏi trong kho: ${allQuestions.length}`);

function pickOne(value, alreadyHasSrc) {
  // 1. Lọc ứng viên theo mức điểm
  let candidates = allQuestions.filter(q => q.value === value);

  if (candidates.length === 0) {
    throw new Error(`Cạn kiệt câu hỏi mức điểm ${value}!`);
  }

  // 2. Xáo trộn danh sách ứng viên
  candidates.sort(() => 0.5 - Math.random());

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];

    // Kiểm tra điều kiện: Nếu gói đã có câu SRC mà câu này cũng có SRC thì bỏ qua
    if (candidate.src && alreadyHasSrc) continue;

    // 3. XÓA THEO ID: Tìm vị trí của câu hỏi dựa trên ID duy nhất
    const originalIndex = allQuestions.findIndex(q => q.id === candidate.id);
    
    if (originalIndex !== -1) {
      // Cắt bỏ khỏi kho câu hỏi ngay lập tức
      const picked = allQuestions.splice(originalIndex, 1)[0];
      return picked;
    }
  }

  throw new Error(`Không tìm thấy câu ${value}đ phù hợp (Có thể do giới hạn SRC).`);
}

function createSet(pointsSequence) {
  let set = [];
  let hasSrcInSet = false;

  pointsSequence.forEach(point => {
    const picked = pickOne(point, hasSrcInSet);
    if (picked.src) hasSrcInSet = true;
    set.push(picked);
  });

  return set;
}

// Khởi tạo các gói câu hỏi
const FINAL_PACKAGES = {
  40: Array.from({ length: 3 }, () => createSet([10, 10, 20])),
  60: Array.from({ length: 3 }, () => createSet([10, 20, 30])),
  80: Array.from({ length: 3 }, () => createSet([20, 30, 30]))
};

// --- KIỂM TRA ĐỘ CHÍNH XÁC ---
const flatResults = Object.values(FINAL_PACKAGES).flat(2);
const uniqueIds = new Set(flatResults.map(q => q.id));

console.log("--------------------------------------");
console.log(`Tổng số câu đã bốc: ${flatResults.length}`);
console.log(`Số lượng ID duy nhất: ${uniqueIds.size}`);

if (flatResults.length === uniqueIds.size) {
  console.log("✅ THÀNH CÔNG: Không có câu nào bị trùng lặp.");
} else {
  console.error("❌ THẤT BẠI: Vẫn còn câu bị trùng lặp!");
}

console.log("Số câu còn lại trong kho sau khi bốc:", allQuestions.length);

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
  players: null,
  scoreboard: {
    revealed: []
  },
  summarizingScores: false,
}

gameState.players = [
  { id: "1", name: "Trần Duy Anh", score: 0, token: uuidv4(), socketId: null },
  { id: "2", name: "Bùi Lê Minh Quang", score: 0, token: uuidv4(), socketId: null },
  { id: "3", name: "Trương Hà Huỳnh Thái", score: 0, token: uuidv4(), socketId: null },
]
gameState.players.forEach(player => {
  console.log(
    `${player.name}: http://10.16.31.53:5174/?token=${player.token}`
  )
})
gameState.obstacle = {
  keyword: "HỆ TUẦN HOÀN",
  rowAnswers:{
      1: null,
      2: null,
      3: null,
      4: null
  },
  rows: [
    {
      id: 1,
      question: "Nguyên tố nào chiếm tỷ lệ cao nhất trong vỏ Trái Đất?",
      answer: "OXY",
      revealed: false,
      disabled: false
    },
    {
      id: 2,
      question: "Biểu tượng của tình yêu trong văn học và nghệ thuật thường là gì?",
      answer: "TIM",
      revealed: false,
      disabled: false
    },
    {
      id: 3,
      question: "Người ta thường gọi diễn viên nữ đóng các vai tuồng là đào. Vậy diễn viên nam đóng các vai tuồng được gọi là gì?",
      answer: "KÉP",
      revealed: false,
      disabled: false
    },
    {
      id: 4,
      question: "Điền vào chỗ trống: \"Hỡi anh em binh sĩ, tự vệ, dân quân!Giờ cứu quốc đã đến. Ta phải hy sinh đến giọt ... cuối cùng, để giữ gìn đất nước.Dù phải gian khổ kháng chiến, nhưng với một lòng kiên quyết hy sinh, thắng lợi nhất định về dân tộc ta!\"",
      answer: "MÁU",
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
      question: "... điện là một tập hợp các linh kiện điện (như nguồn điện, dây dẫn, bóng đèn, điện trở, tụ điện...) được kết nối với nhau bằng dây dẫn thành một vòng kín, qua đó dòng điện có thể chạy qua.",
      answer: "MẠCH"
    },
    imageUrl: "http://10.16.31.53:3000/media/cnv.png"
  },
  currentRow: null,
  timer: 0,
  obstacleClear: false,
  acceptingAnswer: false,
  buzzPlayer: [],
  showAnswers: false,
  centerAnswered: false,
  lockedPlayers: []
}
gameState.speedup =  
{
    questions: [
      { id: 1, text: "Điền số còn thiếu vào chỗ trống?", answer: "3",src:"http://10.16.31.53:3000/media/speedup_1.png", type:"image" },
      { id: 2, text: "Đây là cây cầu nào?", answer: "Mỹ Thuận", src:"http://10.16.31.53:3000/media/speedup_2.mp4", type:"video" },
      { id: 3, text: "Sắp xếp các bước sau để vẽ một nụ cười", answer: "EBDFCA", src:"http://10.16.31.53:3000/media/speedup_3.png", type:"image" },
      { id: 4, text: "Đây là số nào?", answer: "11", src:"http://10.16.31.53:3000/media/speedup_4.mp4", type:"video" }
    ],
    currentQuestion: null,
    timer: 0,
    showAnswers: false,
    running: false,
    locked: false,
    answers: {},
    correctPlayers: []
}
gameState.final = {
  activePlayer: null,
  packageValue: null,
  questions: [],
  currentIndex: 0,
  showContent: false,
  running: false,
  star: false,
  startAt: null,
  buzzWindow: false,
  buzzPlayer: null
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
  if(gameState.obstacle.centerSelected){
    gameState.obstacle.rowAnswers.center = answer
  }
  gameState.obstacle.rowAnswers[rowId][socket.playerId] = answer

  emitState()
})
socket.on("mc:openScoreboard", () => {
  gameState.phase = "scoreboard"
  gameState.scoreboard.revealed = []
emitState()
})
socket.on("mc:revealScore", (playerId) => {
  if (!gameState.scoreboard.revealed.includes(playerId)) {
    gameState.scoreboard.revealed.push(playerId)
    emitState()
  }
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
socket.on("public:startTimer", () => {
  if (socket.role !== "public") return
  if (!gameState.kickoff.running) return
  startTimer()
})

socket.on("mc:showAnswersObstacle", () => {
  gameState.obstacle.showAnswers = true
  emitState()
})

socket.on("mc:showQuestion", () => {
  if (!gameState.kickoff.running) return

  gameState.kickoff.questionVisible = true
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

    const startAt = Date.now()

    gameState.speedup.startAt = startAt
    gameState.speedup.running = true
    gameState.speedup.locked = false

    emitState()

    // Tự động dừng sau 30s
    setTimeout(() => {
      gameState.speedup.running = false
      gameState.speedup.locked = true
      emitState()
    }, SPEED_DURATION)
  })

  // Player gửi đáp án
  socket.on("player:speedAnswer", ({ answer, time }) => {
    if (!gameState.speedup.running) return

    const serverNow = Date.now()
    const serverElapsed =
      (serverNow - gameState.speedup.startAt) / 1000

    // Kiểm tra sai lệch > 0.5s thì dùng serverElapsed
    const safeTime =
      Math.abs(serverElapsed - time) > 0.5
        ? Number(serverElapsed.toFixed(2))
        : Number(time.toFixed(2))

    gameState.speedup.answers[socket.id] = {
      answer,
      time: safeTime
    }

    emitState()
  })
  socket.on("mc:showSpeedAnswers", () => {
    gameState.speedup.showAnswers = true
    emitState()
  })
  socket.on("mc:markSpeedCorrect", (playerId) => {
    if (!gameState.speedup.correctPlayers.find(p => p.id === playerId)) {
      gameState.speedup.correctPlayers.push(playerId)
    }
    emitState()
  })

  socket.on("mc:unmarkSpeedCorrect", (playerId) => {
    gameState.speedup.correctPlayers =
      gameState.speedup.correctPlayers.filter(id => id !== playerId)
    emitState()
  })
socket.on("mc:summarizeScores", () => {
  gameState.summarizingScores = true
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
      const player = gameState.players.find(pl => pl.socketId === p.id)
      if (!player) return

      if (index === 0) player.score += 40
      else if (index === 1) player.score += 30
      else if (index === 2) player.score += 20
      else if (index === 3) player.score += 10
    })

    gameState.speedup.locked = true
    gameState.speedup.currentQuestion = null
    gameState.speedup.showAnswers = false
    gameState.speedup.startAt = null
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
  gameState.obstacle.acceptingAnswer = false

  emitState()
})
socket.on("mc:startRowTimer", () => {
  if (socket.role !== "mc") return

  gameState.obstacle.acceptingAnswer = true
  gameState.obstacle.timer = 15
  const interval = setInterval(() => {
    gameState.obstacle.timer--

    if (gameState.obstacle.timer <= 0) {
      clearInterval(interval)
      gameState.obstacle.acceptingAnswer = false
    }

    emitState()
  }, 1000)
})
socket.on("mc:rowResult", (correct, playerId) => {
  if (socket.role !== "mc") return

  const row = gameState.obstacle.rows.find(
    r => r.id === gameState.obstacle.currentRow
  )

  if (!row) return
    // Add 10 points to the player who answered correctly
    const player = gameState.players.find(p => p.id == playerId)
  if (correct) {
    if (player) player.score += 10
  } else {
  }

  emitState()
})
socket.on("mc:revealCorrectAnswer", (rowId) => {
  if (socket.role !== "mc") return

  const row = gameState.obstacle.rows.find(r => r.id === rowId)
  console.log(row);
  
  if (!row) {
    gameState.obstacle.image.center.revealed = true
    gameState.obstacle.currentRow = null
    gameState.obstacle.showAnswers = false
    gameState.obstacle.centerAnswered = true
    emitState()
    return
  }

  row.revealed = true
  gameState.obstacle.image.parts[row.id - 1].revealed = true
  gameState.obstacle.currentRow = null
  gameState.obstacle.showAnswers = false
  emitState()
})
socket.on("mc:closeRow", () => {
  if (socket.role !== "mc") return
  const row = gameState.obstacle.rows.find(r => r.id === gameState.obstacle.currentRow)
  if (!row) {
    gameState.obstacle.currentRow = null
    gameState.obstacle.showAnswers = false
    gameState.obstacle.centerAnswered = true
    emitState()
  }
  row.revealed = false
  row.disabled = true
  gameState.obstacle.currentRow = null
  gameState.obstacle.showAnswers = false
  emitState()
})
socket.on("player:buzzObstacle", () => {
  if (gameState.obstacle.lockedPlayers.includes(socket.playerId)) return

  gameState.obstacle.buzzPlayer.push(socket.playerId)
  emitState()
})
socket.on("mc:obstacleResult", (correct, id) => {
  const player = gameState.players.find(p => p.socketId === id)

  if (!player) return

  if (correct) {
    const revealedCount =
      gameState.obstacle.rows.filter(r => r.revealed || r.disabled).length
    gameState.obstacle.obstacleClear = true
    const scoreMap = { 0:80, 1: 80, 2: 60, 3: 40, 4: 20 }
    let score = 0
    if(gameState.obstacle.centerSelected){
      score = 10
    }else{
      score = scoreMap[revealedCount] || 0
    }
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
    gameState.obstacle.lockedPlayers.push(id)
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
socket.on("mc:startFinal", (playerId) => {
  gameState.final.activePlayer = playerId
  gameState.final.packageValue = null
  gameState.final.questions = []
  gameState.final.currentIndex = 0
  gameState.final.star = false
  emitState()
})
socket.on("mc:selectPackage", (value) => {
  gameState.final.packageValue = value
  gameState.final.questions = FINAL_PACKAGES[value][gameState.final.activePlayer-1]
  gameState.final.currentIndex = 0
  emitState()
})
socket.on("mc:showFinalContent", () => {
  gameState.final.showContent = true
  emitState()
})
socket.on("mc:toggleStar", () => {
  gameState.final.star = !gameState.final.star
  emitState()
})
socket.on("mc:startFinalTimer", () => {
  const q = gameState.final.questions[
    gameState.final.currentIndex
  ]
  if (!q) return  
  gameState.final.running = true

  const duration =
    q.value === 10 ? 10000 :
    q.value === 20 ? 15000 :
    20000
  const startAt = Date.now()
  gameState.final.startAt = startAt
  
  emitState()
  setTimeout(() => {
    gameState.final.running = false
    emitState()
  }, duration)

})
socket.on("mc:finalCorrect", () => {
  const f = gameState.final
  const q = f.questions[f.currentIndex]
  const player = gameState.players.find(
    p => p.id === f.activePlayer
  )

  let score = q.value
  if (f.star) score *= 2

  player.score += score
  emitState()
})

socket.on("mc:finalNext", () => {
  const f = gameState.final
  f.currentIndex++
  f.star = false
  f.showContent = false
  emitState()
})
socket.on("mc:finalWrong", () => {
  const f = gameState.final
  const q = f.questions[f.currentIndex]
  const active = gameState.players.find(
    p => p.id === f.activePlayer
  )

  if (f.star && active.score - q.value >= 0) {
    active.score -= q.value
  }else if(f.star && active.score - q.value < 0){
      active.score = 0
  }

  f.buzzWindow = true
  f.buzzPlayer = null

  emitState()

  setTimeout(() => {
    f.buzzWindow = false
    emitState()
  }, 5000)
})
socket.on("player:finalBuzz", () => {
  const f = gameState.final
  if (!f.buzzWindow) return
  if (f.buzzPlayer) return

  if (socket.id === f.activePlayer) return

  f.buzzPlayer = socket.id
  f.buzzWindow = false
  emitState()
})
socket.on("mc:finalBuzzCorrect", () => {
  const f = gameState.final
  const q = f.questions[f.currentIndex]

  const buzzer = gameState.players.find(
    p => p.socketId === f.buzzPlayer
  )
  const active = gameState.players.find(
    p => p.id === f.activePlayer
  )

  buzzer.score += q.value

  if (!f.star && active.score - q.value >= 0) {
    active.score -= q.value
  }else if(!f.star && active.score - q.value < 0){
      active.score = 0
  }
  f.buzzPlayer = null

  emitState()
})
socket.on("mc:endKickoffPlayer", () => {
  gameState.currentPlayer = null
  gameState.kickoff.running = false
  gameState.kickoff.questionVisible = false
  emitState()
})
socket.on("mc:finalBuzzWrong", () => {
  const f = gameState.final
  const q = f.questions[f.currentIndex]

  const buzzer = gameState.players.find(
    p => p.socketId === f.buzzPlayer
  )
  if(buzzer.score - q.value / 2 >= 0){
    buzzer.score -= q.value / 2
  }else{
    buzzer.score = 0
  }
  f.buzzPlayer = null

  emitState()
})
socket.on("mc:endFinal", () => {
  gameState.final.activePlayer = null
  gameState.final.packageValue = null
  gameState.final.questions = []
  gameState.final.currentIndex = 0
  gameState.final.showContent = false
  gameState.final.star = false
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
      }else if(gameState.phase === "TangToc") {
        s.emit("state:update", buildSpeedupPlayerState(s))
      }else if(gameState.phase === "VeDich") {
        s.emit("state:update", buildFinalPlayerState(s))
      }
      else{
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

function buildFinalPlayerState(socket) {
  const player = gameState.players.find(
    p => p.id === socket.playerId
  )
  console.log(gameState.final);
  
  return{
    phase: gameState.phase,
    name: player?.name || "Unknown",
    score: player?.score || 0,
    players: gameState.players,
    activePlayer: gameState.final.activePlayer,
    question: gameState.final.questions[gameState.final.currentIndex]?.text || null,
    src: gameState.final.questions[gameState.final.currentIndex]?.src || null,
    buzzWindow: gameState.final.buzzWindow,
    buzzPlayer: gameState.final.buzzPlayer,
    showContent: gameState.final.showContent

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
function buildSpeedupPlayerState(socket) {
  const player = gameState.players.find(
    p => p.id === socket.playerId
  )
  if(!gameState.speedup.currentQuestion){
    return {
      phase: gameState.phase,
      score: player?.score || 0,
    }
  }  
  return {
    phase: gameState.phase,
    score: player?.score || 0,
    currentQuestion: {
      id: gameState.speedup.currentQuestion.id,
      text: gameState.speedup.currentQuestion.text,
      src: gameState.speedup.currentQuestion.src,
      type: gameState.speedup.currentQuestion.type
    },
    startAt: gameState?.speedup?.startAt,
    running: gameState?.speedup?.running
  }
}
function endKickoff() {
  clearInterval(timerInterval)
emitState()}
const PORT = 3000

app.use("/player", express.static(path.join(__dirname, "../player-client/dist")))
app.use("/public", express.static(path.join(__dirname, "../public-screen/dist")))
app.use("/control", express.static(path.join(__dirname, "../control-panel/dist")))
app.use("/media", express.static(path.join(__dirname, "media")))
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT)
})
