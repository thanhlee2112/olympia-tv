<template>
    <audio ref="audioRef"></audio>
  <div class="speed-mc" v-if="state.speedup">

    <!-- Chọn câu hỏi -->
    <div v-if="!state.speedup.currentQuestion">
      <button
        v-for="q in state.speedup.questions"
        :key="q.id"
        @click="selectQuestion(q.id)"
      >
        CÂU {{ q.id }}
      </button>
    </div>

    <!-- Câu hỏi -->
    <div v-else>
      <h2>{{ state.speedup.currentQuestion.text }}</h2>
      <h3>Đáp án: {{ state.speedup.currentQuestion.answer }}</h3>

      <button
        v-if="!state.speedup.running && state.speedup.timer === 0"
        @click="startTimer"
      >
        BẮT ĐẦU
      </button>

      <div v-if="state.speedup.running">
        ⏱ {{ state.speedup.timer.toFixed(2) }}
      </div>

      <button
        v-if="!state.speedup.running && state.speedup.timer >= 30"
        @click="showAnswers = true"
      >
        XEM CÂU TRẢ LỜI
      </button>
    </div>

    <!-- Danh sách trả lời -->
    <div v-if="showAnswers">
      <div
        v-for="(ans, playerId) in state.speedup.answers"
        :key="playerId"
        class="answer-row"
      >
        <div>
          {{ getName(playerId) }} —
          {{ ans.answer }}
          ({{ ans.time.toFixed(2) }}s)
        </div>

        <button
          @click="toggleCorrect(playerId)"
        >
          {{
            state.speedup.correctPlayers.includes(playerId)
              ? "BỎ"
              : "ĐÚNG"
          }}
        </button>
      </div>

      <button
        class="confirm"
        @click="confirmScore"
      >
        XÁC NHẬN CỘNG ĐIỂM
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"
import { socket, state } from "../socket"

const showAnswers = ref(false)
const audioRef=ref(null)

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

async function selectQuestion(id) {
  socket.emit("mc:selectSpeedQuestion", id)
await play('/sounds/speedup_open_question.mp3')

}

async function startTimer() {
  socket.emit("mc:startSpeedTimer")
  play('sounds/speedup_countdown.mp3')
}

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
  const p = state.players.find(p => p.id === id)
  return p?.name || ""
}
</script>

<style scoped>
.speed-mc {
  padding: 20px;
  background: #111;
  color: white;
}

.answer-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px;
  background: #222;
}
.confirm {
  margin-top: 10px;
  padding: 8px 16px;
}
</style>
