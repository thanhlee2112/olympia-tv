<template>
  <div class="mc-wrapper">
    <MCHeader />

    <div class="main-grid">
      <PhaseControl />
      <QuestionPanel />
      <TimerCircle />
      <ScoreBoard />
      <SoundPanel />
    </div>
  </div>
</template>

<script setup>
import MCHeader from "./components/MCHeader.vue"
import PhaseControl from "./components/PhaseControl.vue"
import QuestionPanel from "./components/QuestionPanel.vue"
import TimerCircle from "./components/TimerCircle.vue"
import ScoreBoard from "./components/ScoreBoard.vue"
import SoundPanel from "./components/SoundPanel.vue"
</script>
