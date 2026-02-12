<template>
  <div class="panel">
    <h2>Bảng điểm</h2>
    <div v-for="score in scores" :key="id" class="row">
      {{ score.name }} - {{ score.score }} điểm
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { state } from "../socket"

const scores = ref({})
console.log(state.players);

scores.value = state.players
</script>

<style scoped>
.row {
  margin: 5px 0;
  font-size: 18px;
}
</style>
