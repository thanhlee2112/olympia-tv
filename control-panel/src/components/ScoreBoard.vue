<template>
  <div class="panel">
    <h2>Bảng điểm</h2>
    <div v-for="(s,n) in scores" :key="n" class="row">
      {{ n }} - {{ s }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { socket } from "../socket"

const scores = ref({})

socket.on("scores", s => scores.value = s)
</script>

<style scoped>
.row {
  margin: 5px 0;
  font-size: 18px;
}
</style>
