<template>
<div>
  <audio ref="audioRef"></audio>
  <audio ref="countdownAudioRef"></audio>
  <div v-if="!state.final.activePlayer">
    <div class="final-btn-group">
      <button class="final-btn" @click="playerGoToFinal()">Final</button>
      <button class="final-btn" @click="openScoreboard">Tổng kết điểm</button>
    </div>
    <div class="final-player-list">
      <div
        v-for="p in state.players"
        :key="p.id"
        @click="start(p.id)"
        class="final-player-item"
      >
        {{ p.name }} - {{ p.score }}
      </div>
    </div>
  </div>

  <div v-else>
    <div v-if="!state.final.packageValue" class="final-btn-group">
      <button class="final-btn" @click="pkg(40)">40</button>
      <button class="final-btn" @click="pkg(60)">60</button>
      <button class="final-btn" @click="pkg(80)">80</button>
    </div>

    <div v-else>
      <h2 v-if="state.final.showContent">
        {{
          state.final.questions[
            state.final.currentIndex
          ]?.text
        }}
      </h2>
      <h2 v-if="state.final.showContent">
        {{ 
            state.final.questions[
              state.final.currentIndex
            ]?.answer
        }}
      </h2>
      <div class="final-btn-group">
        <button class="final-btn" @click="showQuestion">Hiển thị câu hỏi</button>
        <button class="final-btn" @click="gapSound">...</button>
        <button class="final-btn" @click="toggleStar">⭐</button>
        <button class="final-btn" @click="startTimer">Start</button>
        <button class="final-btn" @click="correct">ĐÚNG</button>
        <button class="final-btn" @click="wrong">SAI</button>
        <button class="final-btn" @click="nextQuestion">CÂU TIẾP</button>
      </div>
      <div v-if="state.final.buzzPlayer" class="final-buzz-group">
        {{ getName(state.final.buzzPlayer) }}
        <button class="final-btn" @click="buzzCorrect">ĐÚNG</button>
        <button class="final-btn" @click="buzzWrong">SAI</button>
      </div>
      <div v-if="state.final.currentIndex == 2" class="final-btn-group">
        <button class="final-btn" @click="endFinal">Kết thúc phần thi</button>
      </div>
    </div>
  </div>
  <div class="final-btn-group">
    <button class="final-btn" @click="endFinalAll">Kết thúc Về đích</button>
  </div>
</div>
</template>

<script setup>
import { setPhase, socket, state } from "../socket"
import { ref, watch } from "vue"
const audioRef = ref(null)
const countdownAudioRef = ref(null)
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
  () => state.final.buzzPlayer,
  (newBuzzer, oldBuzzer) => {
    if(!oldBuzzer && newBuzzer) {
      // Vòng thi kết thúc, phát âm thanh kết thúc
      play("/sounds/final_buzzer.mp3").catch(err => {
        console.log("Audio error:", err)
      })
      return
    }
  }
)
function openScoreboard() {
  socket.emit("mc:openScoreboard")
}
function showQuestion(){
  socket.emit("mc:showFinalContent")
  play('/sounds/final_open_question.mp3')
}
function gapSound(){
  play('/sounds/gap.mp3')
}
function playerGoToFinal(id){
    play('/sounds/player_start_final.mp3')
}
function start(id){
  socket.emit("mc:startFinal", id)
  play('/sounds/open_questions_pack.mp3')

}
function pkg(v){
  socket.emit("mc:selectPackage", v)
  play('/sounds/choose_question_pack.mp3')
}
console.log(state);

function toggleStar(){
  socket.emit("mc:toggleStar")
  play('/sounds/use_star.mp3')
}
function startTimer(){
  socket.emit("mc:startFinalTimer")
  const currentQuestionPoints = state.final.questions[state.final.currentIndex]?.value || state.final.packageValue
  if(currentQuestionPoints == 10){
    play('/sounds/10s_countdown.mp3')
  }else if(currentQuestionPoints == 20){
    play('/sounds/15s_countdown.mp3')
  }
  else if(currentQuestionPoints == 30){
    play('/sounds/20s_countdown.mp3')
}
}
function nextQuestion(){
  socket.emit("mc:finalNext")
}
function correct(){
  socket.emit("mc:finalCorrect")
  play('/sounds/final_right_answer.mp3')
}
function wrong(){
  socket.emit("mc:finalWrong")
  play('/sounds/final_buzz_window.mp3', countdownAudioRef)
}
function buzzCorrect(){
  socket.emit("mc:finalBuzzCorrect")
    play('/sounds/final_right_answer.mp3')
}
function buzzWrong(){
  socket.emit("mc:finalBuzzWrong")
  play('/sounds/final_wrong_answer.mp3')
}
function getName(id){
  const p = state.players.find(p=>p.socketId===id)
  return p?.name
}
function endFinal(){
  socket.emit("mc:endFinal")
  play('/sounds/player_finish_final.mp3')
}
function endFinalAll(){
  setPhase("dashboard")
}
// ...existing code...
</script>

<style scoped>
.final-btn-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin: 24px 0;
}
.final-btn {
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
.final-btn:hover {
  background: #1565c0;
  transform: scale(1.05);
}
.final-player-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.final-player-item {
  font-size: 1.5rem;
  padding: 14px 32px;
  border-radius: 8px;
  background: #000;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: background 0.2s, transform 0.2s;
}
.final-player-item:hover {
  background: #e3f2fd;
  transform: scale(1.03);
}
.final-buzz-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
  font-size: 1.5rem;
}
</style>
