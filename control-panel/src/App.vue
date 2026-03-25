<template>
  <div class="mc-wrapper">
    <MCHeader />
    <Kickoff v-if="state.phase === 'KhoiDong'" />
    <Obstacle v-else-if="state.phase === 'ChuongNgaiVat'" />
    <Speedup v-else-if="state.phase === 'TangToc'" />
    <Final v-else-if="state.phase === 'VeDich'" />
    <ScoreBoard v-else-if="state.phase === 'scoreboard'" />
    <div v-else class="main-grid">
      <PhaseControl />
      <ScoreBoardAll />
    </div>
  <audio ref="audioRef"></audio>
  </div>
</template>

<script setup>

import Obstacle from "./views/Obstacle.vue"
import Speedup from "./views/Speedup.vue"
import Final from "./views/Final.vue"
import MCHeader from "./components/MCHeader.vue"
import PhaseControl from "./components/PhaseControl.vue"
import ScoreBoard from "./views/ScoreBoard.vue"
import { state } from "./socket"
import Kickoff from "./views/Kickoff.vue"
import { watch } from "vue"
import { ref } from "vue"
import ScoreBoardAll from "./components/ScoreBoardAll.vue"
const audioRef = ref(null)

watch(
  () => state.phase,
  (newPhase, oldPhase) => {
    if (!oldPhase) return

    const map = {
      KhoiDong: "public/sounds/start_kickoff.mp3",
      ChuongNgaiVat: "public/sounds/obstacle_start.mp3",
      TangToc: "public/sounds/start_speedup.mp3",
      VeDich: "public/sounds/start_final.mp3"
    }

    const src = map[newPhase]
    if (!src) return

    const audio = audioRef.value
    audio.src = src
    audio.currentTime = 0
    audio.play().catch(err => {
      console.log("Audio error:", err)
    })
  }

)
</script>
