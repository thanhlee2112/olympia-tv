<template>
  <audio ref="audioRef"></audio>
  <audio ref="countdownAudioRef"></audio>
  <div v-if="state.speedup">

    <div v-if="!state.speedup.currentQuestion">
      <button
        v-for="q in state.speedup.questions"
        :key="q.id"
        @click="selectQuestion(q.id)"
      >
        CÂU {{ q.id }}
      </button>
      <div>
      <button @click="setPhase('dashboard')">
        Trở về Bảng Điều Khiển
      </button>
    </div>
    </div>

    <div v-else>

      <h2>{{ state.speedup.currentQuestion.text }}</h2>
      <h3>Đáp án: {{ state.speedup.currentQuestion.answer }}</h3>

      <div class="timer">
        ⏱ {{ localTime.toFixed(2) }}
      </div>

      <button
        v-if="!state.speedup.running && !state.speedup.locked"
        @click="startTimer"
      >
        BẮT ĐẦU
      </button>

      <button
        v-if="state.speedup.locked"
        @click="showPlayerAnswers"
      >
        XEM CÂU TRẢ LỜI
      </button>

      <div v-if="state.speedup.showAnswers">
        <div
          v-for="(ans, playerId) in state.speedup.answers"
          :key="playerId"
        >
          {{ getName(playerId) }} —
          {{ ans.answer }}
          ({{ ans.time.toFixed(2) }}s)

          <button @click="toggleCorrect(playerId)">
            {{
              state.speedup.correctPlayers.includes(playerId)
                ? "BỎ"
                : "ĐÚNG"
            }}
          </button>
        </div>

        <button @click="confirmScore">
          XÁC NHẬN CỘNG ĐIỂM
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { socket, state,setPhase } from "../socket"

const localTime = ref(0)
let interval = null
const audioRef = ref(null)
const countdownAudioRef= ref(null)

async function selectQuestion(id) {
  await play('/sounds/speedup_open_question.mp3')
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
watch(
  () => state.speedup.startAt,
  (startAt) => {
    if (!startAt) return

    clearInterval(interval)

    interval = setInterval(() => {
      const elapsed =
        (Date.now() - startAt) / 1000

      localTime.value =
        Math.min(elapsed, 30)

      if (elapsed >= 30) {
        clearInterval(interval)
      }
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
}

function getName(id) {
  const p = state.players.find(p => p.socketId === id)  
  return p?.name || ""
}
</script>
