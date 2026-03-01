<template>
  <div class="public">
    <audio ref="audioRef"></audio>
    <audio ref="countdownRef"></audio>
    <h1>PHẦN KHỞI ĐỘNG</h1>

    <div v-if="currentPlayer && showUI" class="center-wrapper">
      <div class="center-container">
        <div class="left">
          <div class="players-strip">
            <div v-for="p in state.players" :key="p.id" class="player-strip-item" :class="{
              active: p.id === state.currentPlayer,
              buzzer: false
            }">
              {{ p.name }} ({{ p.score }})
            </div>
          </div>

          <div v-if="showQuestionPublic" class="question">
            {{ question.question }}
          </div>

          <div class="progress" aria-hidden>
            <div class="progress-fill" :style="{ width: progressWidth }"></div>
          </div>
        </div>

        <div class="right">
          <div class="score-value">{{ score }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted,watch } from "vue"
import { state, socket } from "../socket"

const activePlayer = computed(() => state.currentPlayer)
const currentPlayer = computed(() =>
  (state.players || []).find((p) => p.id === activePlayer.value) || null
)
const showUI = ref(false)
const showQuestionPublic = ref(false)
const timeLeft = computed(() => (activePlayer.value ? state.timer : 0))

const score = computed(() => (currentPlayer.value ? currentPlayer.value.score : 0))

const question = computed(() => {
  if (!activePlayer.value) return ""
  const idx = state.kickoff?.currentIndex ?? 0
  return state.kickoff?.questions?.[idx] || { question: "" }
})
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
async function openQuestion() {
  // Placeholder if needed
  if(!state.kickoff.running) return
  showUI.value = true
  await play("/sounds/open_questions.mp3")
  showQuestionPublic.value = true
  startTimer()
  await play("/sounds/kickoff_countdown.mp3",countdownRef)
}
function startTimer() {
  // Placeholder if needed
    if(!state.kickoff.running) return
    socket.emit("public:startTimer")
}
watch(
  () => state.kickoff.questionVisible,
  (newVal) => {
    if(newVal) {
      openQuestion()
    } else {
      showQuestionPublic.value = false
    }
  }
)
// tick used to force progress recompute regularly
const tick = ref(0)
let _interval = null
onMounted(() => {
  _interval = setInterval(() => { tick.value++ }, 200)
})
onUnmounted(() => { if (_interval) clearInterval(_interval) })

const progressWidth = computed(() => {
  const _t = tick.value
  const val = Number(timeLeft.value) || 0
  const clamped = Math.max(0, Math.min(60, val))
  const elapsed = 60 - clamped
  const pct = (elapsed / 60) * 100
  return pct + "%"
})
</script>

<style scoped>
.public {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.center-wrapper {
  position: static;
  width: 100%;
}

.center-container {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  bottom: 200px;
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  will-change: transform, opacity;
  animation: slideDown 700ms cubic-bezier(.22,.9,.32,1) both;
}

.left {
  flex: 2 1 60%;
  text-align: left;
  padding: 20px 28px;
  background: linear-gradient(180deg,#111,#222);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
}

.players-strip {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
}
.player-strip-item {
  background: rgba(0,0,0,0.45);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
}
.player-strip-item.active { background: #ff8a65; }

.question {
  font-size: 1.6rem;
  color: #fff;
  min-height: 150px;
  overflow: visible;
  line-height: 1.2;
  font-weight: 700;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  flex: 0 0 auto;
}

.right {
  flex: 0 0 30%;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 12px;
  background: transparent;
}

.score-value {
  font-size: 48px;
  line-height: 1;
  color: #0b76d1;
  font-weight: 900;
  min-height: 120px;
  display:flex;
  align-items: center;
  justify-content: center;
  background: #031927;
  padding: 14px 22px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(3,25,39,0.6);
}

.progress {
  margin-top: 18px;
  height: 12px;
  background: rgba(0,0,0,0.35);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex: 0 0 auto;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg,#4caf50,#8bc34a);
  width: 0%;
  transition: width 1s linear;
  position: relative;
  will-change: width;
}
.progress-fill::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%,-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -120vh);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

/* Responsive tweaks */
@media (max-width: 800px) {
  .center-container { flex-direction: column; align-items: stretch; bottom: 120px; }
  .right { justify-content: flex-start; margin-top: 12px; }
}
</style>
