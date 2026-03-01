<template>
  <div class="scoreboard-mc">
    <audio ref="audioRef"></audio>
    <h1>TỔNG KẾT ĐIỂM</h1>

    <div class="players">
      <button
        v-for="p in players"
        :key="p.id"
        :disabled="revealed.includes(p.id)"
        @click="reveal(p.id)"
      >
        {{ p.name }} - {{ p.score }}
      </button>
    </div>

    <button class="back" @click="back">
      Quay về Dashboard
    </button>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { state, socket,setPhase } from "../socket"

const audioRef = ref(null)
const players = computed(() => state.players)
const revealed = computed(() => state.scoreboard.revealed)

function reveal(id) {
  socket.emit("mc:revealScore", id)
}
onMounted(() => {
  play("/sounds/scoreboard_intro.mp3")
})
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
function back() {
    setPhase("dashboard");
}
</script>