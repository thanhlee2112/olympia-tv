<template>
  <div class="app">

    <ScoreBoard :players="state.players" />

    <component :is="currentComponent" />

  </div>
</template>

<script setup>
import { computed } from "vue"
import { state } from "./socket"

import ScoreBoard from "./components/ScoreBoard.vue"
import IntroScreen from "./components/IntroScreen.vue"
import ObstacleRound from "./components/ObstacleRound.vue"
import SpeedRound from "./components/SpeedRound.vue"
import FinishRound from "./components/FinishRound.vue"

console.log(state);

const currentComponent = computed(() => {
  switch (state.phase) {
    case "ChuongNgaiVat":
      return ObstacleRound
    case "TangToc":
      return SpeedRound
    case "VeDich":
      return FinishRound
    default:
      return IntroScreen
  }
})
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  background: #7274e4;
  color: white;
}
</style>
