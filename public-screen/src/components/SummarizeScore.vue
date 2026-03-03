<template>
  <div class="scoreboard-public">
    <div
      v-for="p in revealedPlayers"
      :key="p.id"
      class="score-card"
    >
      <div class="name">{{ p.name }}</div>
      <div class="score">{{ p.score }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { state } from "../socket"

const revealedPlayers = computed(() => {
  // Giữ nguyên thứ tự: thẻ 1 -> thẻ 2 -> thẻ 3 -> thẻ 4
  return state.players.filter(p =>
    state.scoreboard.revealed.includes(p.id)
  )
})
</script>

<style scoped>
.scoreboard-public {
  position: relative;
  overflow: hidden;
  height: 75vh;
  /* Căn chỉnh container chính */
  display: flex;
  flex-direction: column;   /* Xếp các phần tử theo chiều dọc từ trên xuống */
  justify-content: flex-end; /* NEO TẤT CẢ VỀ PHÍA ĐÁY */
  align-items: center;
  padding-bottom: 20px;
}

.score-card {
  width: 400px;
  padding: 20px;
  background: #111;
  border: 3px solid white;
  text-align: center;
  
  /* Tạo khoảng cách đè lên nhau */
  margin-bottom: 30px; /* Thẻ dưới đè lên thẻ trên */
  
  /* Đảm bảo thẻ mới (nằm sau trong DOM) luôn đè lên thẻ cũ */
  z-index: 1; 

  /* Animation */
  animation: slideDown 1s ease forwards;
}

/* Đảm bảo thứ tự chồng xếp: thẻ cuối cùng đè lên các thẻ trước */
.score-card:last-child {
  z-index: 10;
  margin-bottom: 0; /* Thẻ trên cùng không cần margin âm */
}

.name {
  font-size: 28px;
  font-weight: bold;
}

.score {
  font-size: 36px;
  margin-top: 10px;
}

@keyframes slideDown {
  from {
    transform: translateY(-150%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>