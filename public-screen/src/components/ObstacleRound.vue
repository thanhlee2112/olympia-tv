<template>
  <div v-if="state.obstacle">

    <h2>{{ state.obstacle.currentQuestion?.text }}</h2>

    <div class="image-grid">
      <div
        v-for="(part,index) in state.obstacle.image?.parts"
        :key="index"
        class="cell"
      >
        <div v-if="part.revealed">🔓</div>
        <div v-else>❓</div>
      </div>
    </div>

    <div v-if="state.obstacle.buzzPlayer">
      🔔 {{ getName(state.obstacle.buzzPlayer) }}
    </div>

  </div>
</template>

<script setup>
import { state } from "../socket"

function getName(id){
  const p = state.players.find(p=>p.id===id)
  return p?.name
}
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
}
.cell {
  background: #222;
  height: 80px;
  display:flex;
  align-items:center;
  justify-content:center;
}
</style>
