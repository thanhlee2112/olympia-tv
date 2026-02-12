<template>
  <div class="public">
    <h1>PHẦN KHỞI ĐỘNG</h1>

    <div v-if="activePlayer">
      <h2>{{ activePlayer }}</h2>
      <h3>Thời gian: {{ timeLeft }}</h3>
      <div class="question">{{ question }}</div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from "vue"

const state = inject("state")

const activePlayer = computed(() => state.kickoff.activePlayer)

const timeLeft = computed(() =>
  activePlayer.value
    ? state.players[activePlayer.value].kickoff.timeLeft
    : 0
)

const question = computed(() => {
  if (!activePlayer.value) return ""
  const index =
    state.players[activePlayer.value].kickoff.currentQuestionIndex
  return state.kickoff.questions[index]
})
</script>
