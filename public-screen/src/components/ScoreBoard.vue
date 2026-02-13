<template>
  <div class="scoreboard">
    <div
      v-for="p in players"
      :key="p.id"
      class="player"
    >
      <div class="name">{{ p.name }}</div>
      <div class="score">{{ p.score }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  players: Array
})
</script>

<style scoped>
.scoreboard {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: #111;
}

.player {
  text-align: center;
}
.name {
  font-weight: bold;
}
.score {
  font-size: 20px;
}
</style>
