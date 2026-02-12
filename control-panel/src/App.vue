<template>
  <div class="mc-wrapper">
    <MCHeader />
    <Kickoff v-if="state.phase === 'KhoiDong'" />
    <Obstacle v-else-if="state.phase === 'ChuongNgaiVat'" />
    <!-- <Speedup v-else-if="state.phase === 'TangToc'" />
    <Final v-else-if="state.phase === 'VeDich'" /> -->
    <div v-else class="main-grid">
      <PhaseControl />
      <ScoreBoard />
    </div>
  <audio ref="audioRef"></audio>
  </div>
</template>

<script setup>

import Obstacle from "./views/Obstacle.vue"
// import Speedup from "./views/Speedup.vue"
// import Final from "./views/Final.vue"
import MCHeader from "./components/MCHeader.vue"
import PhaseControl from "./components/PhaseControl.vue"
import QuestionPanel from "./components/QuestionPanel.vue"
import TimerCircle from "./components/TimerCircle.vue"
import ScoreBoard from "./components/ScoreBoard.vue"
import SoundPanel from "./components/SoundPanel.vue"
import { state } from "./socket"
import Kickoff from "./views/Kickoff.vue"
import { watch } from "vue"
import { playPhaseSound } from "./utils/sound"
import { ref } from "vue"
const audioRef = ref(null)

watch(
  () => state.phase,
  (newPhase, oldPhase) => {
    if (!oldPhase) return

    const map = {
      KhoiDong: "public/sounds/start_kickoff.mp3",
      ChuongNgaiVat: "public/sounds/start_obstacle.mp3",
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
