<template>
  <div class="speedup-root">
    <div class="timer-bar-vertical">
      <div
        class="fill"
        :style="{
          height: progress + '%',
          transition: 'height 0.2s linear'
        }"
      />
    </div>
    <div class="center-content">
      <h1>TĂNG TỐC</h1>
      <div v-if="state.speedup.currentQuestion && !state.speedup.showAnswers" class="media-block">
        <h2>{{ state.speedup.currentQuestion.text }}</h2>
        <video
          v-if="state.speedup.currentQuestion.type === 'video'"
          ref="videoRef"
          class="media"
          controls="false"
        >
          <source
            :src="state.speedup.currentQuestion.src"
            type="video/mp4"
          />
        </video>
        <img
          v-else-if="state.speedup.currentQuestion.type === 'image'"
          :src="state.speedup.currentQuestion.src"
          class="media"
        />
      </div>
      <div v-else-if="state.speedup.showAnswers">
          <!-- Olympia style answer block -->
          <div class="olympia-answer-list">
            <div
              v-for="player in sortedPlayers"
              :key="'olympia-' + player.id"
              class="olympia-answer-item"
            >
              <div class="olympia-row">
                <div class="olympia-time">{{ getPlayerTime(player.id) }}</div>
                <div class="olympia-dot"></div>
                <div class="olympia-name">{{ player.name }}</div>
              </div>
              <div class="olympia-answer-text">{{ getPlayerAnswer(player.id) }}</div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"
import { state } from "../socket"
const videoRef = ref(null)
watch(
  () => state.speedup.currentQuestion,
  (q) => {
    if (q?.media?.type === "video" && videoRef.value) {
      videoRef.value.load()
      videoRef.value.play()
    }
  }
)
const progress = ref(0)
let timer = null
function updateProgress() {
  if (!state.speedup.startAt) {
    progress.value = 0
    return
  }
  const elapsed = (Date.now() - state.speedup.startAt) / 1000
  progress.value = Math.min((elapsed / 30) * 100, 100)
}
onMounted(() => {
  timer = setInterval(updateProgress, 50)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
watch(
  () => state.speedup.startAt,
  () => {
    updateProgress()
  }
)

import { computed } from "vue"

const sortedPlayers = computed(() => {
  if (!state.players) return []
  // Map each player to their answer/time (if any)
  return [...state.players].map(player => {
    const ans = state.speedup.answer?.find(a => a.id === player.id)
    return {
      ...player,
      answer: ans?.answer,
      time: ans?.time ?? 0
    }
  }).sort((a, b) => a.time - b.time)
})

function getPlayerTime(id) {
  const ans = state.speedup.answer?.find(a => a.id === id)
  return ans ? ans.time.toFixed(2) : '0.00'
}
function getPlayerAnswer(id) {
  const ans = state.speedup.answer?.find(a => a.id === id)
  return ans ? ans.answer : ''
}
</script>

<style scoped>
/* Layout and timer bar */
.speedup-root {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #101c2c;
}
.timer-bar-vertical {
  width: 32px;
  height: 60vh;
  background: #333;
  border-radius: 16px;
  margin-right: 48px;
  display: flex;
  flex-direction: column-reverse;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.12);
}
.timer-bar-vertical .fill {
  width: 100%;
  background: linear-gradient(180deg, #00e676 0%, #2196f3 100%);
  border-radius: 0 0 16px 16px;
  transition: height 0.2s linear;
}
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.media-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h1 {
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 10px;
  letter-spacing: 2px;
}
.media {
  max-width: 1280px;
  max-height: 720px;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(33,150,243,0.10);
  background: #222;
}
h2 {
  color: #fff;
  font-size: 1.7rem;
  margin-top: 1rem;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
}
@media (max-width: 700px) {
  .speedup-root {
    flex-direction: column;
    padding: 16px 0;
  }
  .timer-bar-vertical {
    width: 90vw;
    height: 24px;
    margin: 0 0 32px 0;
    flex-direction: row;
  }
  .timer-bar-vertical .fill {
    height: 100%;
    width: auto;
    transition: width 0.2s linear;
  }
}

/* Player answers list */
.player-answers-list {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.player-answer-item {
  background: rgba(33,150,243,0.10);
  border-radius: 10px;
  margin-bottom: 18px;
  padding: 16px 32px 12px 32px;
  min-width: 260px;
  box-shadow: 0 2px 8px 0 rgba(33,150,243,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
}
.player-time {
  color: #00e676;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 2px;
}
.player-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.player-answer {
  color: #2196f3;
  font-size: 1.1rem;
  margin-top: 2px;
  word-break: break-word;
}

/* Slide-down animation for transition-group */
.slide-down-enter-active {
  transition: all 0.5s cubic-bezier(.23,1.01,.32,1);
}
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(.23,1.01,.32,1);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-40px);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

/* Olympia answer style */
.olympia-answer-list {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.olympia-answer-item {
  background: #232323;
  border-radius: 8px;
  margin-bottom: 12px;
  min-width: 320px;
  box-shadow: 0 2px 8px 0 rgba(33,150,243,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}
.olympia-row {
  display: flex;
  align-items: center;
  padding: 0 0 0 0;
}
.olympia-time {
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 12px;
  min-width: 70px;
  text-align: right;
}
.olympia-dot {
  width: 24px;
  height: 24px;
  background: linear-gradient(180deg, #2196f3 0%, #00e676 100%);
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 2px 8px 0 rgba(33,150,243,0.18);
}
.olympia-name {
  color: #ffeb3b;
  font-size: 1.3rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
  margin-right: 8px;
}
.olympia-answer-text {
  color: #fff;
  font-size: 1.7rem;
  font-weight: 600;
  margin-left: 70px;
  margin-top: 2px;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px #000;
}
</style>
