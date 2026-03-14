<template>
  <div class="obstacle-public" v-if="state.obstacle">
    <h1>VƯỢT CHƯỚNG NGẠI VẬT</h1>

    <div class="obstacle-hint" v-show="!state.obstacle.showAnswers">
      <!-- 4 rows of circles -->
      <div  v-if="!state.obstacle.displayImage" class="rows-circle">
        <div
          v-for="row in state.obstacle.rows"
          :key="row.id"
          class="row-circle-group"
          :class="{ disabled: row.disabled }"
        >
          <span
            v-for="idx in row.answer.length"
            :key="idx"
            class="row-circle-char"
            :class="{
              active: state.obstacle.currentRow === row.id,
              disabled: row.disabled,
              revealed: row.revealed
            }"
          >
            {{ row.revealed ? row.answer?.[idx - 1] : '' }}
          </span>
        </div>
      </div>

      <!-- Image overlay -->
      <div v-else
        class="image-grid-overlay"
        :style="{
          width: imageWidth + 'px',
          height: imageHeight + 'px',
          '--center-size': centerSize + 'px'
        }"
      >
        <img
          :src="state.obstacle.image.imageUrl"
          alt="obstacle"
          class="obstacle-reveal-image"
          @load="onImageLoad"
        />
        <!-- 4 corner overlays -->
        <div
          v-for="(part, i) in state.obstacle.image.parts"
          v-show="!part.revealed"
          :key="'corner-' + i"
          class="corner-box"
          :class="`corner-${['tl', 'tr', 'bl', 'br'][i]}`"
        >
          {{ i + 1 }}
        </div>
        <div class="line v-top"></div>
        <div class="line v-bottom"></div>
        <div class="line h-left"></div>
        <div class="line h-right"></div>
        <!-- Center box -->
        <div class="center-box-overlay" v-show="!state.obstacle.image.center.revealed">
          TRUNG TÂM
        </div>
      </div>
    </div>
    <div v-if="state.obstacle.buzzPlayer && state.obstacle.buzzPlayer.length > 0" class="buzz-row-box">
      <div v-for="player in state.obstacle.buzzPlayer" :key="player.id" class="buzz-rect" disabled>
        <span class="buzz-player-name">{{ getPlayerName(player) }}</span>
      </div>
    </div>
    <!-- Question section -->
    <div v-if="state.obstacle.currentRow || (state.obstacle.centerSelected && !state.obstacle.centerAnswered)" class="question-wrapper">
      <div class="question-container">
        <div class="left">
          <div v-if="!state.obstacle.centerSelected" class="question">
            {{ getRowQuestion(state.obstacle.currentRow) }}
          </div>
          <div v-else-if="!state.obstacle.centerAnswered" class="question">
            {{ state.obstacle.image.center.question }}
          </div>
        </div>
      </div>
      
      <!-- Timer circle positioned on the right -->
      <div class="timer-circle-inline" :class="{ running: isTimerRunning }">
        {{ state.obstacle.timer }}
      </div>
    </div>
    <!-- Buzz button -->
    <!-- Player answers display when timer is running -->
    <div v-if="state.obstacle.showAnswers" class="player-answers-display">
      <h3>Đáp án từ các thí sinh:</h3>
      <div class="answers-list">
        <div
          v-for="player in state.players"
          :key="player.id"
          class="answer-item"
        >
          <span class="player-name">{{ player.name }}:</span>
          <span class="answer-text">{{ getPlayerAnswer(player.id) || '(chưa trả lời)' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { state, socket } from "../socket"
const openAnswerFromPlayer = ref(false)

const imageWidth = ref(480)
const imageHeight = ref(480)
const centerSize = ref(300)

function onImageLoad(e) {
  imageWidth.value = e.target.naturalWidth
  imageHeight.value = e.target.naturalHeight
  // Tỉ lệ center box: 60% chiều nhỏ nhất
  centerSize.value = Math.floor(Math.min(imageWidth.value, imageHeight.value) * 0.6)
}

function getRowQuestion(rowId) {
  const row = state.obstacle.rows.find(r => r.id === rowId)
  return row?.question || ""
}

function getPlayerAnswer(playerId) {
  const currentRowId = state.obstacle.currentRow
  if (!currentRowId && !state.obstacle.centerSelected) return ""
  let rowAnswers = null;
  if(!currentRowId && state.obstacle.centerSelected){
    rowAnswers = state.obstacle.rowAnswers[5]
  }else if(currentRowId){
    rowAnswers = state.obstacle.rowAnswers[currentRowId]
  }  
  return rowAnswers ? rowAnswers[playerId] : ""
}
function getPlayerName(playerId) {
  const player = state.players.find(p => p.id === playerId)
  return player ? player.name : "Unknown"
}
const isTimerRunning = computed(() => {
  return state.obstacle.currentRow && state.obstacle.timer > 0
})
</script>

<style scoped>
.obstacle-public {
  padding: 20px;
  color: white;
  background: #101c2c;
  min-height: 100vh;
}

.obstacle-hint {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

/* Rows circle */
.rows-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin: 32px 0 24px 0;
}

.row-circle-group {
  display: flex;
  gap: 6px;
  padding: 0 8px;
}

.row-circle-group.disabled {
  opacity: 0.5;
}

.obstacle-reveal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Circle default: blue background */
.row-circle-char {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e3f2fd;
  border: 2px solid #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #1976d2;
  font-weight: bold;
  transition: background 0.2s, color 0.2s;
}

/* Active: darker blue */
.row-circle-char.active {
  background: #1565c0;
  border-color: #1565c0;
  color: #fff;
}

/* Disabled: gray */
.row-circle-char.disabled {
  background: #b0bec5;
  border-color: #b0bec5;
  color: #78909c;
}

/* Revealed: light cyan */
.row-circle-char.revealed {
  background: #21cbf3;
  color: #1976d2;
}

/* Image overlay */
.image-grid-overlay {
  position: relative;
  width: 100%;
  height: 100%;
  /* center size sẽ được truyền từ biến style */
  box-sizing: border-box;
  border: 2px solid #1976d2; /* outer blue border */
}

.corner-box {
  /* cover full overlay; pseudo-elements create the L-shape */
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 1; /* sit under separators and center */
  pointer-events: none;
}

/* helper var for calculations */
.image-grid-overlay {
  --S: calc(50% - (var(--center-size) / 2));
}

/* each corner uses two pseudo elements forming an L (a horizontal and a vertical bar) */
.corner-box::before,
.corner-box::after {
  content: "";
  position: absolute;
  background: #222;
  box-sizing: border-box;
  border: none; /* corner fills only; separators will render the blue seams */
  z-index: -1; /* under separators and center */
}

.line {
  position: absolute;
  background: #1976d2;
  z-index: 2;
}

/* vertical top */
.v-top {
  width: 2px;
  height: 25%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* vertical bottom */
.v-bottom {
  width: 2px;
  height: 25%;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

/* horizontal left */
.h-left {
  height: 2px;
  width: 25%;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* horizontal right */
.h-right {
  height: 2px;
  width: 25%;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.corner-tl {
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px;
}

.corner-tl::before {
  /* top horizontal bar: spans full left-to-middle area, height = --S */
  top: 0;
  left: 0;
  right: 50%;
  height: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-tl::after {
  /* left vertical bar: spans top-to-middle, width = --S */
  top: 0;
  left: 0;
  bottom: 50%;
  width: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-tr {
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
}

.corner-tr::before {
  /* top horizontal bar: spans middle-to-right area */
  top: 0;
  left: 50%;
  right: 0;
  height: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-tr::after {
  /* right vertical bar: spans top-to-middle */
  top: 0;
  right: 0;
  bottom: 50%;
  width: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-bl {
  align-items: flex-end;
  justify-content: flex-start;
  padding: 8px;
}

.corner-bl::before {
  /* bottom horizontal bar: spans left-to-middle area */
  bottom: 0;
  left: 0;
  right: 50%;
  height: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-bl::after {
  /* left vertical bar: spans middle-to-bottom area */
  top: 50%;
  left: 0;
  bottom: 0;
  width: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-br {
  align-items: flex-end;
  justify-content: flex-end;
  padding: 8px;
}

.corner-br::before {
  /* bottom horizontal bar: spans middle-to-right area */
  bottom: 0;
  left: 50%;
  right: 0;
  height: var(--S);
  /* no blue borders here; separators draw seams */
}

.corner-br::after {
  /* right vertical bar: spans middle-to-bottom area */
  top: 50%;
  right: 0;
  bottom: 0;
  width: var(--S);
  /* no blue borders here; separators draw seams */
}

.center-box-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--center-size);
  height: var(--center-size);
  background: #1976d2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  font-weight: bold;
  box-sizing: border-box;
  z-index: 3; /* above corner fills */
  border: 2px solid #1976d2; /* blue border around center */
}

/* Question section */
.question-section {
  text-align: center;
  margin-top: 20px;
}

.question {
  color: #fff;
  font-size: 1.1rem;
}

.question-wrapper {
  position: static;
  width: 100%;
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.question-container {
  position: static;
  width: auto;
  max-width: 800px;
  flex: 1;
  animation: slideInUp 0.7s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
}

.timer-circle-inline {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #222, #111);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: bold;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5) inset, 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 100;
  position: relative;
  flex-shrink: 0;
  animation: slideInUp 0.7s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
}

.timer-circle-inline::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg at 50% 50%, #2196f3 0deg, #2196f3 90deg, transparent 180deg);
  -webkit-mask: radial-gradient(circle, transparent 55%, black 60%, black 100%);
  mask: radial-gradient(circle, transparent 55%, black 60%, black 100%);
  pointer-events: none;
  opacity: 0;
}

.timer-circle-inline.running::after {
  animation: ringRotateFade 1s linear infinite;
}

@keyframes ringRotateFade {
  0% {
    opacity: 1;
    transform: rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: rotate(-360deg);
  }
}

.question-container .left {
  flex: 1;
  text-align: center;
  padding: 40px 48px;
  background: linear-gradient(180deg, #111, #222);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 600px;
}

.question-container .question {
  font-size: 1.6rem;
  color: #fff;
  line-height: 1.4;
  font-weight: 700;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(100px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Buzz player horizontal row */
/* Buzz player horizontal row aligned left */
.buzz-row-box {
  display: flex;
  flex-direction: row;
  gap: 18px;
  margin-top: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
}

.buzz-rect {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 16px 24px;
  background: #ff9800;
  gap: 8px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: not-allowed;
}

.buzz-player-id {
  font-size: 0.95rem;
  color: #fffde7;
  font-weight: 600;
}

.buzz-player-name {
  font-size: 1.2rem;
  color: #fff;
  font-weight: 700;
}

/* Answer section */
.answer-section {
  margin-top: 30px;
  text-align: center;
}

.answer-section input {
  padding: 10px;
  font-size: 16px;
  width: 250px;
}

.submitted-line {
  margin-bottom: 10px;
  color: #21cbf3;
}

h1 {
  text-align: center;
  color: #fff;
  margin-bottom: 20px;
}

/* Player answers display */
.player-answers-display {
  margin-top: 40px;
  padding: 20px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12px;
  border: 2px solid #2196f3;
}

.player-answers-display h3 {
  color: #fff;
  text-align: center;
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  color: #fff;
}

.player-name {
  flex: 0 0 180px;
  font-weight: bold;
  color: #ffeb3b;
}

.answer-text {
  flex: 1;
  color: #21cbf3;
}
</style>
