<template>
  <div class="speedup-root">
    <div v-if="state.speedup.currentQuestion && !state.speedup.showAnswers" class="olympia-container">
      
      <div class="olympia-layout">
        <div class="main-content-area">
          <div class="media-unfold-wrapper">
            <div class="media-box">
               <h2 class="question-text">{{ state.speedup.currentQuestion.text }}</h2>
               <div class="media-wrapper">
                  <video
                    v-show="state.speedup.currentQuestion.type === 'video' && state.speedup.startAt"
                    ref="videoRef"
                    class="media"
                    preload="auto"
                    @ended="onVideoEnded"
                  >
                    <source :src="state.speedup.currentQuestion.src" type="video/mp4" />
                  </video>
                  <img
                    v-show="state.speedup.currentQuestion.type === 'image'"
                    :src="state.speedup.currentQuestion.src"
                    class="media"
                  />
               </div>
            </div>
          </div>

          <div class="olympia-base-bar">
            <div class="wood-slider"></div>
            <div class="question-tag">CÂU {{ state.speedup.currentQuestion.id }}</div>
          </div>
        </div>

        <div class="timer-unfold-wrapper">
          <div class="timer-vertical">
             <div class="fill" :style="{ height: progress + '%' }"></div>
          </div>
        </div>
      </div>

    </div>

    <div v-else-if="state.speedup.showAnswers" class="answer-overlay">
       <div class="olympia-answer-list">
          <div v-for="player in sortedPlayers" :key="player.id" class="olympia-answer-item">
            <div class="olympia-time">{{ getPlayerTime(player.socketId) }}</div>
            <div class="olympia-dot"></div>
            <div class="olympia-name-ans">
              <div class="olympia-name">{{ player.name }}</div>
              <div class="olympia-answer-text">{{ getPlayerAnswer(player.socketId) }}</div>
            </div>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
/* Định nghĩa biến để dễ quản lý chiều cao đồng bộ */
:root {
  --olympia-height: 550px; 
}

.speedup-root {
  width: 100vw;
  height: 100vh;
  position: relative;
  perspective: 2500px;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.olympia-container {
  position: absolute;
  bottom: 100px; 
  display: flex;
  justify-content: center;
  width: 100%;
}

.olympia-layout {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.main-content-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  flex: 1;
}

/* THANH NGANG ĐẾ */
.olympia-base-bar {
  position: relative;
  width: 100%;
  height: 45px;
  background: #000;
  border-top: 1px solid #444;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  z-index: 10;
}

.wood-slider {
  position: absolute;
  top: 0;
  right: 150px;
  width: calc(100% - 150px);
  height: 16px;
  background: linear-gradient(to bottom, #8b4513, #4d260b);
  animation: slideInWood 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.question-tag {
  position: absolute;
  right: 0;
  width: 150px;
  height: 100%;
  background: #f1c40f;
  color: #000;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

/* KHUNG MEDIA CỐ ĐỊNH CHIỀU CAO */
.media-unfold-wrapper {
  transform-origin: bottom;
  transform: rotateX(-90deg);
  opacity: 0;
  animation: unfold3D 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 0.5s;
}

.media-box {
  width: 100%;
  height: 100%; /* Media chiếm 80% main-content-area */
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.media-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 80vw;
  min-height: 70vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media {
  max-width: 100%;
  width: 80vw;
  height: 60vh;
  max-height: 100%;
  object-fit: contain;
}

.question-text {
  color: #fff;
  font-size: 1.6rem;
  margin-bottom: 15px;
  text-align: center;
  min-height: 2.4rem; /* Giữ chỗ cho text */
}

/* TIMER DỰNG ĐỨNG */
.timer-unfold-wrapper {
  transform-origin: bottom;
  transform: rotateX(-90deg);
  opacity: 0;
  height: 100%;
  animation: unfold3D 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 0.8s;
}

.timer-vertical {
  width: 40px;
  /* CỐ ĐỊNH: Chiều cao chuẩn */
  height: 100%; 
  background: #000;
  border: 1px solid #333;
  display: flex;
  flex-direction: column-reverse;
}

.timer-vertical .fill {
  width: 100%;
  background: linear-gradient(to top, #00ff88, #008855);
}

@keyframes unfold3D {
  0% { transform: rotateX(-90deg); opacity: 0; }
  100% { transform: rotateX(0deg); opacity: 1; }
}

@keyframes slideInWood {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

.answer-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Styling cho danh sách đáp án SpeedRound */
.olympia-answer-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(0,0,0,0.85);
  border-radius: 18px;
  padding: 32px 48px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  min-width: 420px;
}

.olympia-answer-item {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #181818;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  min-height: 56px;
}

.olympia-time {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ff88;
  width: 70px;
  text-align: right;
}

.olympia-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1c40f 60%, #e67e22 100%);
  margin-right: 8px;
}

.olympia-name-ans {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.olympia-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.olympia-answer-text {
  font-size: 1.1rem;
  color: #f1c40f;
  font-weight: 500;
  word-break: break-word;
}
</style>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue"
import { state } from "../socket"

const videoRef = ref(null)
const progress = ref(0)
let timer = null

function onVideoEnded() { 
  if (videoRef.value) {
    videoRef.value.pause();
    // Cưỡng bức video dừng ở giây cuối cùng để tránh hiện thumbnail load lại
    videoRef.value.currentTime = videoRef.value.duration;
  } 
}
watch(

  () => state.speedup.currentQuestion,

  (q) => {

    if (q?.type === "video" && videoRef.value) {

      videoRef.value.load()

    }

  }

)

watch(

  () => state.speedup.startAt,

  (startAt) => {

    if (startAt && videoRef.value) {

      videoRef.value.currentTime = 0

      videoRef.value.play()

    }

  }

)
function updateProgress() {
  if (!state.speedup.startAt) { progress.value = 0; return }
  const elapsed = (Date.now() - state.speedup.startAt) / 1000
  progress.value = Math.min((elapsed / 30) * 100, 100)
}

onMounted(() => { timer = setInterval(updateProgress, 50) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const sortedPlayers = computed(() => {
  if (!state.players) return []
  return [...state.players].map(p => ({
    ...p,
    time: state.speedup.answers?.[p.socketId]?.time ?? 0
  })).sort((a, b) => a.time - b.time)
})

function getPlayerTime(id) { return state.speedup.answers[id]?.time.toFixed(2) || '0.00' }
function getPlayerAnswer(id) { return state.speedup.answers[id]?.answer || '' }
</script>