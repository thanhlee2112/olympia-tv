<template>
  <div class="panel">
    <h2>Âm thanh</h2>
    <button @click="play('intro')">Intro</button>
    <button @click="play('khoidong')">Khởi động</button>
    <button @click="play('tangtoc')">Tăng tốc</button>
  </div>
</template>

<script setup>
const sounds = {
  intro: new Audio("/sounds/intro.mp3"),
  khoidong: new Audio("/sounds/khoidong.mp3"),
  tangtoc: new Audio("/sounds/tangtoc.mp3")
}

function play(name) {
  sounds[name].currentTime = 0
  sounds[name].play()
}
</script>
