<template>
  <div class="score-board">
    <div v-for="p in players" :key="p.id" class="player-box">
      <h2 class="glow">{{ p.name }}</h2>
      <h1>{{ p.score }}</h1>
    </div>
  </div>
</template>

<script setup>
defineProps(["players"])
</script>
