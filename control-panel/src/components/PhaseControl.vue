<template>
  <div class="panel">
    <h2>Điều khiển vòng thi</h2>
    <button v-for="p in phases" :key="p" @click="change(p)">
      {{ p }}
    </button>
  </div>
</template>

<script setup>
import { socket } from "../socket"

const phases = ["KhoiDong","ChuongNgaiVat","TangToc","VeDich"]

function change(p) {
  socket.emit("changePhase", p)
}
</script>

<style scoped>
button {
  margin: 5px;
  padding: 10px;
  background: #2563eb;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
