<template>
  <div>
    <ScoreBoard :players="players" />

    <component :is="currentComponent" :data="roundData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { io } from "socket.io-client"

import ScoreBoard from './components/ScoreBoard.vue'
import IntroScreen from './components/IntroScreen.vue'
import ObstacleRound from './components/ObstacleRound.vue'
import SpeedRound from './components/SpeedRound.vue'
import FinishRound from './components/FinishRound.vue'

const socket = io("http://localhost:3000")

const players = ref([])
const currentComponent = ref("IntroScreen")
const roundData = ref({})

onMounted(() => {
  socket.on("updatePlayers", data => {
    players.value = data
  })

  socket.on("changeRound", round => {
    if (round === "obstacle") currentComponent.value = ObstacleRound
    if (round === "speed") currentComponent.value = SpeedRound
    if (round === "finish") currentComponent.value = FinishRound
  })
})
</script>
