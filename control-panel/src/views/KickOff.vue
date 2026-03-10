<template>
  <div class="kickoff">
    <audio ref="audioRef"></audio>
    <audio ref="countdownRef"></audio>
    <h1>VÒNG KHỞI ĐỘNG</h1>

    <!-- ========================= -->
    <!-- 1. CHƯA CHỌN NGƯỜI CHƠI -->
    <!-- ========================= -->
    <div v-if="!state.kickoff.running">
      <h2>Chọn người chơi</h2>

      <div class="players">
        <div
          v-for="p in state.players"
          :key="p.id"
          class="player-card"
          @click="start(p.id)"
        >
          <h3>{{ p.name }}</h3>
          <p>Điểm: {{ p.score }}</p>
        </div>
      </div>
      <div class="kickoff-btn-group">
        <button class="kickoff-btn" @click="openScoreboard">
           TỔNG KẾT ĐIỂM
        </button>
        <button class="kickoff-btn" @click="endKickoff">Kết thúc phần thi khởi động</button>
      </div>
    </div>

    <!-- ========================= -->
    <!-- 2. ĐANG THI -->
    <!-- ========================= -->
    <div v-else>
    
      <h2>Người chơi: {{ currentPlayer?.name }}</h2>
      <h3>Thời gian: {{ state.timer }}s</h3>
      <div v-if="!state.kickoff.questionVisible" class="kickoff-btn-group">
        <button class="kickoff-btn" @click="MCshowQuestion">
          MỞ CÂU HỎI
        </button>
      </div>
    
      <div v-else>
        <h2>{{ currentQuestion?.question }}</h2>
        <p class="answer">
          Đáp án (MC): {{ currentQuestion?.answer }}
        </p>
        <div class="kickoff-btn-group">
          <button class="kickoff-btn correct" @click="answerQuestions(true)">
            Đúng (+10)
          </button>
          <button class="kickoff-btn wrong" @click="answerQuestions(false)">
            Sai
          </button>
          <button class="kickoff-btn" @click="gapSound">
            ...
          </button>
          <button class="kickoff-btn" @click="endKickoffPlayer">
            Kết thúc phần thi khởi động
          </button>
        </div>
      </div>
    
    </div>


  </div>
</template>

<script setup>
import { computed } from "vue"
import { state, startKickoff, answer,showQuestion,setPhase, socket } from "../socket"
import { watch } from "vue"
import { ref } from "vue"
const audioRef = ref(null)
const countdownRef = ref(null)
function play(src,ref = audioRef) {
  return new Promise((resolve, reject) => {
    const audio = ref.value

    audio.src = src
    audio.currentTime = 0

    audio.onended = resolve
    audio.onerror = reject

    audio.play().catch(reject)
  })
}
function answerQuestions(isCorrect) {
  answer(isCorrect)
  if (isCorrect) {
    play("/sounds/correct_answer_kickoff.mp3").catch(err => {
      console.log("Audio error:", err)
    })
  }
} 
function start(playerId) {
  startKickoff(playerId)
  play("/sounds/player_start_kickoff.mp3").catch(err => {
    console.log("Audio error:", err)
  })
}
async function MCshowQuestion() {
  showQuestion()
}
const currentPlayer = computed(() =>
  state.players.find(p => p.id === state.currentPlayer)
)

const currentQuestion = computed(() =>
  state.kickoff.questions?.[state.kickoff.currentIndex]
)
function summarizeScores() {
  socket.emit("mc:summarizeScores")
  play("/sounds/summarize_scores.mp3").catch(err => {
    console.log("Audio error:", err)
  })
}
function gapSound(){
  play('/sounds/gap.mp3').catch(err => {
    console.log("Audio error:", err)
  })
}
function openScoreboard() {
  socket.emit("mc:openScoreboard")
}
function endKickoffPlayer() {
  // Kết thúc phần thi khởi động của người chơi hiện tại
  // Có thể gửi sự kiện đến server để kết thúc phần thi của người chơi
  // Ví dụ: endKickoffPlayer()
  socket.emit("mc:endKickoffPlayer")
  play("/sounds/player_finish_kickoff.mp3").catch(err => {
    console.log("Audio error:", err)
  })
}
function endKickoff() {
  // Kết thúc vòng thi khởi động
  // Có thể gửi sự kiện đến server để kết thúc vòng thi
  // Ví dụ: endKickoffRound()
  setPhase("dashboard")
}
</script>

<style scoped>
.kickoff {
  padding: 20px;
}

/* ...existing code... */
.players {
  display: flex;
  gap: 20px;
}

.player-card {
  padding: 20px;
  background: #1e293b;
  color: white;
  cursor: pointer;
  border-radius: 10px;
  transition: 0.2s;
}

.player-card:hover {
  background: #2563eb;
}

.kickoff-btn-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin: 24px 0;
}
.kickoff-btn {
  font-size: 2rem;
  padding: 18px 40px;
  border-radius: 12px;
  background: #1976d2;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s, transform 0.2s;
}
.kickoff-btn:hover {
  background: #1565c0;
  transform: scale(1.05);
}
.kickoff-btn.correct {
  background: #43a047;
}
.kickoff-btn.wrong {
  background: #e53935;
}
.answer {
  margin-top: 10px;
  color: yellow;
}
</style>
