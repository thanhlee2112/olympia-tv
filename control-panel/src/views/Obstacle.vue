<template>
    <audio ref="audioRef"></audio>
    <audio ref="countdownAudioRef"></audio>
  <div v-if="state && state.obstacle" class="obstacle-mc">
    <h1>VƯỢT CHƯỚNG NGẠI VẬT</h1>
    <!-- 🔐 Từ khóa -->
    <!-- 🟦 4 HÀNG NGANG (tròn) -->
     <div class="obstacle-hint">
    <h2 class="keyword">TỪ KHÓA: {{ state.obstacle.keyword }}</h2>
      <div class="rows-circle">
      <div
        v-for="row in state.obstacle.rows"
        :key="row.id"
        class="row-circle-group"
        :class="rowClass(row)"
        @click="selectRow(row)"
      >
        <template v-for="(char, idx) in row.answer.length" :key="idx">
          <span
            class="row-circle-char"
            :class="[
              { 'active': state.obstacle.currentRow === row.id },
              { 'disabled': row.disabled },
              { 'revealed': row.revealed }
            ]"
          >
            {{ row.revealed ? row.answer[idx] : '' }}
          </span>
        </template>
      </div>
    </div>
    <!-- 🖼 4 góc và 1 ô trung tâm overlay -->
    <div class="image-grid-overlay">
      <div class="corner-box corner-tl" :class="{ revealed: state.obstacle.image.parts[0]?.revealed }">
        {{ state.obstacle.image.parts[0]?.revealed ? "MỞ" : "1" }}
      </div>
      <div class="corner-box corner-tr" :class="{ revealed: state.obstacle.image.parts[1]?.revealed }">
        {{ state.obstacle.image.parts[1]?.revealed ? "MỞ" : "2" }}
      </div>
      <div class="corner-box corner-bl" :class="{ revealed: state.obstacle.image.parts[2]?.revealed }">
        {{ state.obstacle.image.parts[2]?.revealed ? "MỞ" : "3" }}
      </div>
      <div class="corner-box corner-br" :class="{ revealed: state.obstacle.image.parts[3]?.revealed }">
        {{ state.obstacle.image.parts[3]?.revealed ? "MỞ" : "4" }}
      </div>
      <div class="center-box-overlay" :class="{ enabled: canSelectCenter }" @click="selectCenter">
        TRUNG TÂM
      </div>
    </div>
     </div>
    
    <!-- ❓ CÂU HỎI -->
    <div v-if="currentRow" class="question-box">
      <h3>{{ currentRow.question }}</h3>
      <button v-if="!state.obstacle.acceptingAnswer"
              @click="startTimer">
        BẮT ĐẦU ĐẾM NGƯỢC
      </button>
      <div v-if="state.obstacle.acceptingAnswer">
        ⏳ {{ state.obstacle.timer }}
      </div>
      <button
        v-if="state.obstacle.timer === 0"
        @click="showPlayerAnswer"
      >
        XEM CÂU TRẢ LỜI
      </button>
        <div v-if="showAnswer">
          <h4>CÂU TRẢ LỜI THÍ SINH</h4>
        
          <div
            v-for="(ans, playerId) in state.obstacle.rowAnswers"
            :key="playerId"
            class="player-answer-row"
          >
            <div class="answer-left">
              <strong>{{ getPlayerName(playerId) }}</strong>:
              <span class="answer-text">{{ ans }}</span>
            </div>
        
            <div class="answer-center">
              <button
                class="score-btn"
                @click="rowResult(true, playerId)"
              >
                ĐÚNG
              </button>
              <button
                class="score-btn"
                @click="rowResult(false, playerId)"
              >
                SAI
                </button>
            </div>
            <div v-if="state.obstacle.rows.find(r => r.id === state.obstacle.currentRow).revealed" class="answer-right">
              <button
                class="score-btn"
                @click="addScore(playerId)"
              >
                +10
              </button>
            </div>
          </div>
      
          <div class="row-final-actions">
            <button @click="revealCorrectAnswer(currentRow.id)">
              HIỆN ĐÁP ÁN CHUẨN
            </button>
            <button @click="closeRow(currentRow.id)">
              KẾT THÚC HÀNG
            </button>
          </div>
        </div>

    </div>
    <!-- 🔔 BUZZ -->
    <div v-if="state.obstacle.buzzPlayer" class="buzz-box-rect">
      <div class="buzz-title">Thí sinh bấm chuông:</div>
      <div class="buzz-name">{{ buzzName }}</div>
      <div class="buzz-btns">
        <button @click="obstacleResult(true)">ĐÚNG</button>
        <button @click="obstacleResult(false)">SAI</button>
      </div>
    </div>
    <div>
      <button v-if="state.obstacle.obstacleClear" @click="returnToDashboard">Trở về màn hình chính</button>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref,watch } from "vue"
import { setPhase, socket, state } from "../socket"

const showAnswer = ref(false)
const audioRef = ref(null)
const countdownAudioRef = ref(null)
const currentRow = computed(() => {
  return state.obstacle.rows.find(
    r => r.id === state.obstacle.currentRow
  )
})
const rowAnswers = computed(() => {
  const rowId = state.obstacle.currentRow
  if (!rowId) return {}
  return state.obstacle.rowAnswers?.[rowId] || {}
})
watch(
  () => state.obstacle.buzzPlayer,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      await play('/sounds/buzz_obstacle.mp3')
    }
  }
)
function getPlayerName(id) {
  const p = state.players.find(p => p.id === id)
  return p?.name || ""
}

const buzzName = computed(() => {
  const p = state.players.find(
    p => p.id === state.obstacle.buzzPlayer
  )
  return p?.name || ""
})

const canSelectCenter = computed(() =>
  state.obstacle.rows.every(r => r.revealed || r.disabled)
)

async function showPlayerAnswer(){
  showAnswer.value = true
  await play('/sounds/reveal_player_answer.mp3')
}

function rowClass(row) {
  return {
    active: state.obstacle.currentRow === row.id,
    revealed: row.revealed,
    disabled: row.disabled
  }
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
async function selectRow(row) {
  if (row.disabled || row.revealed) return
  await play("/sounds/select_row_obstacle.mp3")
  socket.emit("mc:selectRow", row.id)
}

async function startTimer() {
  socket.emit("mc:startRowTimer")
  await play("/sounds/obstacle_countdown.mp3", countdownAudioRef)
}

async function rowResult(correct, playerId) {
  socket.emit("mc:rowResult", correct, playerId)
  if (correct) {
    await play("/sounds/correct_answer_obstacle.mp3")
  } else {
    await play("/sounds/wrong_answer_obstacle.mp3")
  }
}

function obstacleResult(correct) {
  socket.emit("mc:obstacleResult", correct)
  if(correct){
    play('/sounds/right_answer_obstacle.mp3')
  }else{
    play('sounds/wrong_answer_obstacle.mp3')
  }
}
function revealCorrectAnswer(rowId) {
  socket.emit("mc:revealCorrectAnswer", rowId)
  play('/sounds/open_image.mp3')
}
function closeRow(row) {
  socket.emit("mc:closeRow", row)
}
function selectCenter() {
  if (!canSelectCenter.value) return
  socket.emit("mc:selectCenter")
}
function returnToDashboard(){
    //
    setPhase("dashboard");
}

</script>

<style scoped>
.obstacle-mc {
  padding: 10px;
  color: white;
  background: #111;
  display:flex;
  justify-content: space-between
  
}

/* 4 hàng ngang dạng tròn */
/* 4 hàng ngang dạng tròn với từng ký tự */
.rows-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 32px 0 24px 0;
}
.row-circle-group {
  display: flex;
  gap: 6px;
  cursor: pointer;
  padding: 0 8px;
}
.row-circle-group.active {
  background: rgba(33,150,243,0.08);
  border-radius: 16px;
}
.row-circle-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}
/* Circle default: blue background */
.row-circle-char {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2196f3;
  border: 2px solid #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
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
/* Revealed: lighter blue */
.row-circle-char.revealed {
  background: #21cbf3;
  color: #1976d2;
}

/* Lưới hình ảnh 2x2 với ô trung tâm */
/* 4 góc và 1 ô trung tâm overlay */
/* 4 góc dính liền nhau che hình ảnh */
.image-grid-overlay {
  position: relative;
  width: 480px;
  height: 480px;
  margin: 32px auto 0 auto;
}
.corner-box {
  position: absolute;
  width: 240px;
  height: 240px;
  background: #222;
  color: #fff;
  display: flex;
  font-size: 1.2rem;
  border-radius: 0;
  border: 2px solid #1976d2;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  transition: background 0.2s, color 0.2s;
}
.corner-box.revealed {
  background: #fff;
  color: #1976d2;
  font-weight: bold;
}
.corner-tl {
  top: 0;
  left: 0;
  align-items: baseline;
}
.corner-tr {
  top: 0;
  right: 0px;
  justify-content: end;
}
.corner-bl {
  bottom: 0;
  left: 0;
  align-items: end;
}
.corner-br {
  bottom: 0;
  right: 0;
  align-items: end;
  justify-content: end;
}
.center-box-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 250px;
  height: 250px;
  background: #1976d2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  border-radius: 12px;
  border: 2px solid #2196f3;
  cursor: not-allowed;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  transition: background 0.2s, color 0.2s;
  transform: translate(-50%, -50%);
  z-index: 2;
}
.center-box-overlay.enabled {
  background: gold;
  color: #1976d2;
  cursor: pointer;
}

.question-box {
  margin-top: 30px;
}


/* Buzz box as a right-side red rectangle */
.buzz-box-rect {
  position: fixed;
  top: 80px;
  right: 32px;
  width: 25vw;
  min-width: 220px;
  max-width: 340px;
  height: 150px;
  background: #c62828;
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(198,40,40,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px 10px;
}
.buzz-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 6px;
}
.buzz-name {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #ffd600;
  text-shadow: 0 1px 4px #b71c1c;
}
.buzz-btns {
  display: flex;
  gap: 12px;
}
.buzz-btns button {
  background: #fff;
  color: #c62828;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 1px 4px #b71c1c22;
  transition: background 0.2s, color 0.2s;
}
.buzz-btns button:hover {
  background: #ffd600;
  color: #b71c1c;
}
</style>
