<template>
  <div class="panel">
    <h2>Bảng điểm</h2>
    <button
      v-for="(score, idx) in scores"
      :key="score.id"
      class="score-btn"
      @click="playRankSound(idx)"
    >
      {{ score.name }} - {{ score.score }} điểm
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { state } from "../socket"

const scores = ref([])
console.log(state.players);

// Sắp xếp điểm giảm dần và gán thứ hạng
scores.value = [...state.players].sort((a, b) => b.score - a.score)

function playRankSound(idx) {
  // idx là thứ tự trong mảng đã sort, 0 là nhất
  const rank = idx + 1
  let soundFile = ''
  if (rank === 1) soundFile = '/sounds/1st-player.mp3'
  else if (rank === 2) soundFile = '/sounds/2nd-player.mp3'
  else if (rank === 3) soundFile = '/sounds/3th-player.mp3'
  else soundFile = '/sounds/4th-player.mp3'
  const audio = new Audio(soundFile)
  audio.play()
}
</script>

<style scoped>
.score-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 12px 20px;
  font-size: 18px;
  background: linear-gradient(90deg, #2196f3, #21cbf3);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.score-btn:hover {
  background: linear-gradient(90deg, #1976d2, #00bcd4);
  transform: translateY(-2px) scale(1.03);
}
</style>
