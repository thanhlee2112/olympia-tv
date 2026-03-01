<template>
  <audio ref="audioRef"></audio>
  <audio ref="countdownAudioRef"></audio>
  
  <div v-if="state.speedup" class="speedup-container">

    <div v-if="!state.speedup.currentQuestion" class="selection-screen">
      <div class="grid-questions">
        <button
          v-for="q in state.speedup.questions"
          :key="q.id"
          @click="selectQuestion(q.id)"
          class="btn-question"
        >
          CÂU {{ q.id }}
        </button>
      </div>
      <div class="nav-footer">
        <button @click="setPhase('dashboard')" class="btn-back">
          Trở về Bảng Điều Khiển
        </button>
      </div>
    </div>

    <div v-else class="question-screen">
      
      <div class="olympia-wrapper">
        <div class="main-black-bar">
          <div class="wood-slider"></div>
          <div class="question-number-tag">
            CÂU {{ state.speedup.currentQuestion.id }}
          </div>
        </div>
      </div>

      <div class="content-box">
        <h2 class="question-text">{{ state.speedup.currentQuestion.text }}</h2>
        <h3 v-if="state.speedup.showAnswers" class="answer-text">
          Đáp án: {{ state.speedup.currentQuestion.answer }}
        </h3>

        <div class="timer-display" :class="{ 'timer-running': state.speedup.running }">
          ⏱ {{ localTime.toFixed(2) }}s
        </div>

        <div class="control-actions">
          <button
            v-if="!state.speedup.running && !state.speedup.locked"
            @click="startTimer"
            class="btn-start"
          >
            BẮT ĐẦU
          </button>

          <button
            v-if="state.speedup.locked && !state.speedup.showAnswers"
            @click="showPlayerAnswers"
            class="btn-view"
          >
            XEM CÂU TRẢ LỜI
          </button>
        </div>
      </div>

      <div v-if="state.speedup.showAnswers" class="player-results">
        <div
          v-for="(ans, playerId) in state.speedup.answers"
          :key="playerId"
          class="player-card"
        >
          <span class="p-name">{{ getName(playerId) }}:</span>
          <span class="p-ans">{{ ans.answer }}</span>
          <span class="p-time">({{ ans.time.toFixed(2) }}s)</span>

          <button @click="toggleCorrect(playerId)" class="btn-check" :class="{ 'is-correct': state.speedup.correctPlayers.includes(playerId) }">
            {{ state.speedup.correctPlayers.includes(playerId) ? "ĐÚNG" : "SAI" }}
          </button>
        </div>

        <button @click="confirmScore" class="btn-confirm">
          XÁC NHẬN CỘNG ĐIỂM
        </button>
      </div>
          <button @click="openScoreboard">
  Tổng kết điểm
</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { socket, state, setPhase } from "../socket"

const localTime = ref(0)
let interval = null
const audioRef = ref(null)
const countdownAudioRef = ref(null)

async function selectQuestion(id) {
  play('/sounds/speedup_open_question.mp3')
  socket.emit("mc:selectSpeedQuestion", id)
}

function showPlayerAnswers() {
  socket.emit("mc:showSpeedAnswers")
  play('/sounds/open_answer.mp3')
}

async function startTimer() {
  socket.emit("mc:startSpeedTimer")
  await play('/sounds/speedup_countdown.mp3', countdownAudioRef)
}
function openScoreboard() {
  socket.emit("mc:openScoreboard")
}
function play(src, refObj = audioRef) {
  return new Promise((resolve, reject) => {
    const audio = refObj.value
    if (!audio) return resolve()
    audio.src = src
    audio.currentTime = 0
    audio.onended = resolve
    audio.onerror = reject
    audio.play().catch(resolve) // Tránh lỗi trình duyệt chặn autoplay
  })
}

watch(
  () => state.speedup.startAt,
  (startAt) => {
    if (!startAt) {
      localTime.value = 0
      return
    }
    clearInterval(interval)
    interval = setInterval(() => {
      const elapsed = (Date.now() - startAt) / 1000
      localTime.value = Math.min(elapsed, 30)
      if (elapsed >= 30) clearInterval(interval)
    }, 10)
  }
)

function toggleCorrect(id) {
  if (state.speedup.correctPlayers.includes(id))
    socket.emit("mc:unmarkSpeedCorrect", id)
  else
    socket.emit("mc:markSpeedCorrect", id)
}

function confirmScore() {    
  socket.emit("mc:confirmSpeedScore")
  if(state.speedup.correctPlayers.length > 0) {
    play('/sounds/right_answer_obstacle.mp3')
  }
}

function getName(id) {
  const p = state.players.find(p => p.socketId === id)  
  return p?.name || "Thí sinh"
}
</script>

<style scoped>
.speedup-container {
  font-family: 'Segoe UI', sans-serif;
  color: white;
  padding: 20px;
}

/* CSS CHO THANH TRƯỢT OLYMPIA */
.olympia-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.main-black-bar {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 40px;
  background: #111;
  border-bottom: 2px solid #333;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.wood-slider {
  position: absolute;
  top: 0;
  right: 100px;
  width: 60%;
  height: 15px;
  background: linear-gradient(to bottom, #8b4513, #5d2e16);
  border: 1px solid #3d1f0e;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  /* Animation quan trọng nhất */
  animation: slideWood 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.question-number-tag {
  position: absolute;
  right: 0;
  width: 100px;
  height: 100%;
  background: #f1c40f;
  color: black;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: slideTag 0.8s ease-out forwards;
}

/* Animation Keyframes */
@keyframes slideWood {
  0% { transform: translateX(120%); }
  100% { transform: translateX(0); }
}

@keyframes slideTag {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

/* UI Phụ trợ */
.question-text {
  text-align: center;
  font-size: 1.8rem;
  margin: 20px 0;
}

.timer-display {
  font-size: 2.5rem;
  text-align: center;
  font-weight: bold;
  color: #e74c3c;
  margin: 20px;
}

.timer-running {
  color: #2ecc71;
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
}

.grid-questions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.btn-question {
  padding: 20px;
  font-size: 1.2rem;
  background: #2980b9;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.btn-start {
  display: block;
  margin: 0 auto;
  padding: 15px 40px;
  background: #27ae60;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.player-card {
  background: rgba(255,255,255,0.1);
  margin: 5px 0;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.is-correct {
  background: #27ae60 !important;
}
</style>