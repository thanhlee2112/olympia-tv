<template>
  <div class="countdown glow">
    {{ data.question || "CHƯỚNG NGẠI VẬT" }}
  </div>
</template>

<script setup>
defineProps(["data"])
</script>
