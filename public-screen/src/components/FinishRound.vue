<template>
  <div class="final-round">
    <div v-if="!state.final.activePlayer" class="intro">
      <h1>VỀ ĐÍCH</h1>
    </div>

    <div v-else-if="state.final.activePlayer" class="game-area">
      <!-- PACKAGES PANEL - Right side, always visible -->
      <div class="packages-panel" :class="{ 'packages-visible': !state.final.packageValue || packageAnimationState === 'initial' || packageAnimationState === 'selected', 'packages-hidden': packageAnimationState === 'disappearing' || packageAnimationState === 'showing-content' }">
        <div
          v-for="pkg in [40, 60, 80]"
          :key="pkg"
          class="package"
          :class="{
            selected: state.final.packageValue === pkg,
            dimmed: state.final.packageValue && state.final.packageValue !== pkg
          }"
        >
          {{ pkg }}
        </div>
      </div>

      <!-- QUESTION AREA - Center, appears after packages animate out -->
      <div v-if="state.final.packageValue" class="question-area">
        <!-- Video hiển thị phía trên khung câu hỏi -->
        <div v-if="state.final.questions[state.final.currentIndex]?.src && state.final.showContent" class="video-frame" style="width: 100%; display: flex; justify-content: center; margin-bottom: 24px;">
          <video
            :src="state.final.questions[state.final.currentIndex]?.src"
            controls
            style="width: 100%; max-width: 900px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);"
          ></video>
        </div>
        <div class="center-wrapper">
          <div class="center-container" :class="{ 'animate-in': packageAnimationState === 'showing-content' }">
                                <div class="star-wrap">
                <div v-if="state.final.star" class="star">⭐</div>
                      </div>           
            <div class="left">
              <div class="players-strip">
                <div v-for="p in state.players" :key="p.id" class="player-strip-item" :class="{
                  active: p.id === state.final.activePlayer,
                  buzzer: p.socketId === state.final.buzzPlayer && state.final.buzzPlayer != null
                }">
                  {{ p.name }} ({{ p.score }})
                </div>
              </div>
              <div class="question">
                <template v-if="state.final.showContent">
                  {{ state.final.questions[state.final.currentIndex]?.text }}
                </template>
              </div>

              <div class="progress" aria-hidden>
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
            </div>

            <div class="right">
              <div class="package-value">GÓI {{ state.final.packageValue }}</div>
              <div class="score-value">{{ activePlayer?.score }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- Danh sách thí sinh -->
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue"
import { state } from "../socket"

const activePlayer = computed(() =>
  state.players.find(
    p => p.id === state.final.activePlayer
  )
)

const packageAnimationState = ref('initial')
let animationTimeout = null
let contentTimeout = null
const progressFrozen = ref(false)

watch(
  () => state.final.packageValue,
  (newValue) => {
    // Clear any pending timeouts
    if (animationTimeout) clearTimeout(animationTimeout)
    if (contentTimeout) clearTimeout(contentTimeout)
    
    // Reset progress frozen state on new package
    progressFrozen.value = false

    if (newValue) {
      // Package selected: set to selected state
      packageAnimationState.value = 'selected'

      // After 1s (hold selected state), start animating packages out and show content
      animationTimeout = setTimeout(() => {
        packageAnimationState.value = 'disappearing'
      }, 1000)

      // At 1.5s, show center-container (0.5s after packages start disappearing)
      contentTimeout = setTimeout(() => {
        packageAnimationState.value = 'showing-content'
      }, 3000)
    } else {
      packageAnimationState.value = 'initial'
    }
  }
)

// Watch for when showContent changes
watch(
  () => state.final.showContent,
  (newValue) => {
    // When question is hidden (showContent = false), reset progress
    if (!newValue) {
      progressFrozen.value = false
    }
  }
)

const tick = ref(0)
let _interval = null
onMounted(() => {
  _interval = setInterval(() => {
    tick.value++
  }, 200)
})
onUnmounted(() => {
  if (_interval) clearInterval(_interval)
  if (animationTimeout) clearTimeout(animationTimeout)
  if (contentTimeout) clearTimeout(contentTimeout)
})

const progress = computed(() => {
  // include tick as a reactive dependency so this computed re-evaluates
  const _t = tick.value

  // If progress is frozen (reached 100% while showContent is true), keep it at 100%
  if (progressFrozen.value && state.final.showContent) {
    return 100
  }

  if (!state.final.running || !state.final.startAt) return 0

  const q = state.final.questions[state.final.currentIndex]
  if (!q) return 0

  const duration = q.value === 10 ? 10 : q.value === 20 ? 15 : 20
  const elapsed = (Date.now() - state.final.startAt) / 1000
  const currentProgress = Math.min((elapsed / duration) * 100, 100)
  console.log(currentProgress);
  console.log(state.final);
  
  // When progress reaches 100%, freeze it
  if (currentProgress >= 98) {
    progressFrozen.value = true
    return 100
  }
  
  return currentProgress
})
</script>

<style scoped>
.final-round {
  padding: 40px;
  text-align: center;
  position: relative;
  min-height: 100vh;
}

.game-area {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* ========================= */
/* PACKAGES PANEL - Right Side */
/* ========================= */

.packages-panel {
  position: fixed;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 40px;
  z-index: 100;
  transition: opacity 0.3s ease;
}

.packages-panel.packages-visible {
  opacity: 1;
  pointer-events: auto;
}

.packages-panel.packages-hidden {
  opacity: 0;
  pointer-events: none;
  animation: slideUpOut 1s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
}

.package {
  background: #222;
  padding: 30px 50px;
  border-radius: 16px;
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 0.9, 0.32, 1);
  border: 3px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.package:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.package.dimmed {
  opacity: 0.35;
  transform: scale(0.95);
  color: #999;
}

.package.selected {
  background: #ff8a65;
  color: #000;
  border-color: #ffb74d;
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(255, 138, 101, 0.5);
  font-weight: 900;
}

@keyframes slideUpOut {
  0% {
    opacity: 1;
    transform: translateY(-50%);
  }
  100% {
    opacity: 0;
    transform: translateY(-120vh);
  }
}

/* ========================= */
/* QUESTION AREA */
/* ========================= */

.question-area {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.center-wrapper {
  position: static;
  width: 100%;
}

.center-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 200px;
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  opacity: 0;
  transition: none;
}

.center-container.animate-in {
  opacity: 1;
  animation: slideInUp 0.9s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.package-value {
  font-size: 30px;
  margin-bottom: 12px;
  color: #fff;
}

.active-player {
  font-size: 40px;
  margin-bottom: 20px;
  color: yellow;
}

.score {
  margin-left: 20px;
  
}
.package-and-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;

}

.left {
  flex: 2 1 60%;
  text-align: left;
  padding: 20px 28px;
  background: linear-gradient(180deg,#111,#222);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.5) inset;

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

.players-strip {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-around;
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
.player-strip-item.buzzer { background: #ff8a65; font-weight: 700; }

.star-wrap {
  position: fixed;
  top: -50px;
  left: 10px;
   margin-bottom: 6px; 
}
.star { color: #ffd54f; font-size: 22px; }

.question {
  font-size: 40px;
  color: #fff;
  min-height: 150px;
  overflow: visible;
  line-height: 1.2;
  font-weight: 700;
}

.package-value {
  font-size: 14px;
  color: #fff;
  background: #0b76d1;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: center;
  align-self: center;
  justify-content: center;
}

.score-value {
  font-size: 72px;
  line-height: 1;
  color: #0b76d1;
  font-weight: 900;
  min-height: 180px;
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
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg,#00b0ff,#0077cc);
  width: 0%;
  transition: width 0.2s linear;
  position: relative;
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

/* ========================= */
/* TIMER */
/* ========================= */

.timer-bar {
  height: 20px;
  background: #333;
  margin-bottom: 30px;
}

.fill {
  height: 100%;
  background: red;
}

/* ========================= */
/* DANH SÁCH THÍ SINH */
/* ========================= */

.players {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.player {
  padding: 10px 20px;
  background: #111;
  border-radius: 10px;
}

.player.active {
  border: 2px solid yellow;
}

.player.buzzer {
  background: orange;
  font-weight: bold;
}
.intro {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 40px;
}
</style>
