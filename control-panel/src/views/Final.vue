<template>
<div>
  <audio ref="audioRef"></audio>
  <audio ref="countdownAudioRef"></audio>
  <div v-if="!state.final.activePlayer">
    <div>
    <button @click="playerGoToFinal()">Final</button>
    <button @click="openScoreboard">
  Tổng kết điểm
</button>
  </div>
    <div
      v-for="p in state.players"
      :key="p.id"
      @click="start(p.id)"
    >
      {{ p.name }} - {{ p.score }}
    </div>
  </div>

  <div v-else>
    <div v-if="!state.final.packageValue">
      <button @click="pkg(40)">40</button>
      <button @click="pkg(60)">60</button>
      <button @click="pkg(80)">80</button>
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
      <button @click="showQuestion">Hiển thị câu hỏi</button>
      <button @click="gapSound">...</button>
      <button @click="toggleStar">⭐</button>
      <button @click="startTimer">Start</button>
      <button @click="correct">ĐÚNG</button>
      <button @click="wrong">SAI</button>
      <button @click="nextQuestion">CÂU TIẾP</button>
      <div v-if="state.final.buzzPlayer">
        {{ getName(state.final.buzzPlayer) }}
        <button @click="buzzCorrect">ĐÚNG</button>
        <button @click="buzzWrong">SAI</button>
      </div>
      <div v-if="state.final.currentIndex == 2">
        <button @click="endFinal">Kết thúc phần thi</button>
      </div>
    </div>

  </div>
  <div>
    <button @click="endFinalAll">Kết thúc Về đích</button>
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
  play('/sounds/final_buzz_window.mp3',countdownAudioRef)
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
</script>
