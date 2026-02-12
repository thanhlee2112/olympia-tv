<template>
  <div class="panel center">
    <svg width="150" height="150">
      <circle cx="75" cy="75" r="60"
        stroke="#334155" stroke-width="10" fill="none"/>
      <circle cx="75" cy="75" r="60"
        stroke="#facc15"
        stroke-width="10"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 75 75)" />
      <text x="75" y="85" text-anchor="middle"
        font-size="30">{{ timer }}</text>
    </svg>
    <button @click="start">Start 15s</button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { socket } from "../socket"

const timer = ref(0)
const max = 15
const circumference = 2 * Math.PI * 60

const offset = computed(() =>
  circumference - (timer.value / max) * circumference
)

socket.on("timer", t => timer.value = t)

function start() {
  socket.emit("startTimer", max)
}
</script>

<style scoped>
.center {
  text-align: center;
}
</style>
