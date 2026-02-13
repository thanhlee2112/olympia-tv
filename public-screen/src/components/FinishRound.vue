<template>
  <div class="final-round">
  <div v-if="!state.final.activePlayer" class="intro">
     <h1>VỀ ĐÍCH</h1>
  </div>
    <!-- ========================= -->
    <!-- CHƯA CHỌN GÓI -->
    <!-- ========================= -->
    <div v-else-if="!state.final.packageValue && state.final.activePlayer" class="packages">
      <div class="package">40</div>
      <div class="package">60</div>
      <div class="package">80</div>
    </div>

    <!-- ========================= -->
    <!-- ĐÃ CHỌN GÓI -->
    <!-- ========================= -->
    <div v-else-if="state.final.activePlayer" class="question-area">
      <div class="players">
        <div v-for="p in state.players" :key="p.id" class="player" :class="{
          active: p.id === state.final.activePlayer,
          buzzer: p.id === state.final.buzzPlayer
        }">
          {{ p.name }} - {{ p.score }}
        </div>
      </div>
      <!-- Giá trị gói -->
      <div class="question-section-split">
        <div class="question-block-bg">
          <div class="question-block">
            <div>
              <div v-if="state.final.star" style="color: yellow; font-size: 24px;">⭐</div>
            </div>
            <div v-if="state.final.showContent" class="question">
              {{
                state.final.questions[
                  state.final.currentIndex
                ]?.text
              }}
            </div>
          </div>
        </div>
        <div class="package-score-block-bg">
          <div class="package-score-block">
            <div class="package-value">
              GÓI {{ state.final.packageValue }}
            </div>
            <div class="score-value">
              {{ activePlayer?.score }}
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách thí sinh -->


    </div>

  </div>
</template>

<script setup>
import { computed } from "vue"
import { state } from "../socket"

const activePlayer = computed(() =>
  state.players.find(
    p => p.id === state.final.activePlayer
  )
)

const progress = computed(() => {
  if (!state.final.running || !state.final.startAt)
    return 0

  const q =
    state.final.questions[state.final.currentIndex]

  if (!q) return 0

  const duration =
    q.value === 10 ? 10 :
      q.value === 20 ? 15 :
        20

  const elapsed =
    (Date.now() - state.final.startAt) / 1000

  return Math.min((elapsed / duration) * 100, 100)
})
</script>

<style scoped>
.final-round {
  padding: 40px;
  text-align: center;
}

/* ========================= */
/* GÓI CÂU HỎI */
/* ========================= */

.packages {
  display: flex;
  justify-content: center;
  gap: 60px;
  font-size: 60px;
}

.package {
  background: #222;
  padding: 40px 80px;
  border-radius: 20px;
}

/* ========================= */
/* CÂU HỎI */
/* ========================= */

.package-value {
  font-size: 30px;
  margin-bottom: 20px;
}

.active-player {
  font-size: 40px;
  margin-bottom: 20px;
  color: yellow;
}

.score {
  margin-left: 20px;
}
.package-and-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;

}
/* Split question and package/score blocks, move down */
/* Split question and package/score blocks, move down */
.question-section-split {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 60px;
  margin-top: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 200px;
  min-height: 120px;
  padding: 0;
}
.question-block-bg {
  flex: 2;
  background: #857d7d;
  border-radius: 18px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 0 32px 40px;
}
.question-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.question {
  font-size: 36px;
  color: #fff;
}
.package-score-block-bg {
  flex: 1;
  background: #857d7d;
  border-radius: 18px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 32px 40px 32px 0;
}
.package-score-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}
.package-value {
  font-size: 30px;
  margin-bottom: 12px;
  color: #fff;
}
.score-value {
  font-size: 40px;
  color: yellow;
  font-weight: bold;
}

/* ========================= */
/* TIMER */
/* ========================= */

.timer-bar {
  height: 20px;
  background: #333;
  margin-bottom: 30px;
}

.fill {
  height: 100%;
  background: red;
}

/* ========================= */
/* DANH SÁCH THÍ SINH */
/* ========================= */

.players {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.player {
  padding: 10px 20px;
  background: #111;
  border-radius: 10px;
}

.player.active {
  border: 2px solid yellow;
}

.player.buzzer {
  background: orange;
  font-weight: bold;
}
.intro {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 40px;
}
</style>
