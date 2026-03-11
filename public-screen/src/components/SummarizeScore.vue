<template>
  <div class="scoreboard-wrapper">
    <transition name="container-slide-left">
      <div v-if="hasStarted" class="lower-third-container">
        
        <div class="pipe-connection"></div>

        <div class="main-panel">
          <div :key="latestPlayer?.id" class="dynamic-content">
            
            <div class="photo-holder-wrapper">
               <div class="photo-holder">
                  <div class="score-inside">{{ latestPlayer?.score }}</div>
               </div>
            </div>

            <div class="text-content-center">
              <div class="name">{{ latestPlayer?.name }}</div>
            </div>
            
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { state } from "../socket"

const hasStarted = computed(() => state.scoreboard.revealed.length > 0)

const latestPlayer = computed(() => {
  const revealedIds = state.scoreboard.revealed;
  if (revealedIds.length === 0) return null;
  const lastId = revealedIds[revealedIds.length - 1];
  return state.players.find(p => p.id === lastId);
})
</script>

<style scoped>
.scoreboard-wrapper {
  position: fixed;
  top: 75%; 
  left: 35%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  perspective: 2000px;
}

.lower-third-container {
  display: flex;
  align-items: center;
  scale: 1.5; 
}

.pipe-connection {
  width: 100px;
  height: 24px;
  background: linear-gradient(to bottom, #d4a76a, #8b6b3f);
  border-radius: 12px 0 0 12px;
}

.main-panel {
  width: 600px; 
  height: 100px;
  background: #1a1a1a;
  border: 3px solid #d4a76a;
  border-left: none;
  border-radius: 0 12px 12px 0;
  position: relative;
  display: flex;
  align-items: center;
}

.dynamic-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.photo-holder-wrapper {
  position: absolute;
  left: 15px;
  bottom: 50px;
}

.photo-holder {
  width: 110px;
  height: 110px;
  background: radial-gradient(circle, #cc0000, #660000);
  border: 4px solid #d4a76a;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Hiệu ứng lật trục giữa, chậm 0.5s */
  animation: flipCenter 1.0s ease-out;
  transform-origin: center; 
  backface-visibility: hidden;
}

.score-inside {
  color: white;
  font-size: 32px;
  font-weight: 900;
}

.text-content-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding-left: 60px;
}

.name {
  font-size: 38px;
  font-weight: bold;
  color: #d4a76a;
  text-transform: uppercase;
  white-space: nowrap;
}

/* ----------------------------------------------
 * ANIMATION: LẬT Ô ĐỎ (CENTER FLIP)
 * ---------------------------------------------- */
@keyframes flipCenter {
  0% { 
    transform: rotateX(-90deg);
    opacity: 0.5;
  }
  100% { 
    transform: rotateX(0deg); 
    opacity: 1;
  }
}

/* ----------------------------------------------
 * TRANSITION: TRƯỢT TỪ TRÁI SANG (LẦN ĐẦU XUẤT HIỆN)
 * ---------------------------------------------- */
.container-slide-left-enter-active {
  /* Hiệu ứng trượt mượt mà trong 0.8 giây */
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
}

.container-slide-left-enter-from {
  opacity: 0;
  /* Đẩy khung sang trái 200px trước khi xuất hiện */
  transform: translateX(-200px);
}
</style>