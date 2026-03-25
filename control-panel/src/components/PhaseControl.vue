<template>
  <div class="panel">
    <h2>Điều khiển vòng thi</h2>
        <button @click="playPhaseSound('BatDauChuongTrinh')">
      Bắt đầu chương trình
    </button>
    <button @click="playPhaseSound('GioiThieuThiSinh')">
      Giới thiệu thí sinh
    </button>
    <button
      v-for="p in phases"
      :key="p.label"
      @click="change(p.value)"
    >
      {{ p.label }}
    </button>

  </div>
</template>

<script setup>
import { setPhase } from "../socket"

const phases = [
  { label: "Khởi Động", value: "KhoiDong" },
  { label: "Vượt Chướng Ngại Vật", value: "ChuongNgaiVat" },
  { label: "Tăng Tốc", value: "TangToc" },
  { label: "Về Đích", value: "VeDich" }
]

const sounds = {
  KhoiDong: new Audio("../public/sounds/start_kickoff.mp3"),
  ChuongNgaiVat: new Audio("../public/sounds/chuongngaivat.mp3"),
  TangToc: new Audio("../public/sounds/tangtoc.mp3"),
  VeDich: new Audio("../public/sounds/vedich.mp3"),
  BatDauChuongTrinh: new Audio("../public/sounds/intro.mp3"),
  GioiThieuThiSinh: new Audio("../public/sounds/introduce_player.mp3"),
}

function change(phase) {
  setPhase(phase)
  playPhaseSound(phase)
}

function playPhaseSound(phase) {
  const audio = sounds[phase]
  console.log(audio);
  
  if (!audio) return

  audio.currentTime = 0
  audio.play().catch(() => {})
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
