<template>
  <div class="panel">
    <h2>Câu hỏi hiện tại</h2>
    <div>{{ question?.text }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { socket } from "../socket"

const question = ref(null)

socket.on("gameState", state => {
  question.value = state.question
})
</script>
