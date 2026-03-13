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

<style scoped>
.scoreboard-mc {
  background: #111;
  color: #fff;
  padding: 32px 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h1 {
  font-size: 2.6rem;
  font-weight: bold;
  margin-bottom: 32px;
  letter-spacing: 2px;
}
.players {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin-bottom: 40px;
}
.players button {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 24px 48px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.15);
  margin: 8px 0;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  cursor: pointer;
  opacity: 1;
}
.players button:disabled {
  background: #b0bec5;
  color: #78909c;
  cursor: not-allowed;
  opacity: 0.7;
}
.players button:hover:not(:disabled) {
  background: #1565c0;
  color: #ffd600;
  transform: scale(1.05);
}
.back {
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 18px 40px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(198,40,40,0.15);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  cursor: pointer;
}
.back:hover {
  background: #b71c1c;
  color: #ffd600;
  transform: scale(1.07);
}
</style>