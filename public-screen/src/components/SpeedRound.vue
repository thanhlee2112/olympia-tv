<template>
  <div class="speedup-root">
    <div v-if="isVideoLoading" class="loading-status">
      <div class="spinner"></div>
      <span>ĐANG NẠP VIDEO VÀO RAM...</span>
    </div>

    <div v-if="state.speedup.currentQuestion && !state.speedup.showAnswers" class="olympia-container">
      <div class="olympia-layout">
        
        <div class="timer-unfold-wrapper">
          <div class="timer-vertical">
            <div class="fill" :style="{ height: progress + '%' }"></div>
          </div>
        </div>

        <div class="main-content-area">
          <div class="media-unfold-wrapper">
            <div class="media-box">
              <h2 class="question-text">{{ state.speedup.currentQuestion.text }}</h2>
              <div class="media-wrapper">
                <video
                  v-show="state.speedup.currentQuestion.type === 'video' && state.speedup.startAt"
                  ref="videoRef"
                  class="media"
                  :src="videoBlobUrl"
                  playsinline
                  webkit-playsinline
                  @ended="onVideoEnded"
                ></video>

                <img
                  v-show="state.speedup.currentQuestion.type === 'image'"
                  :src="`/assets/images/${state.speedup.currentQuestion.src}`"
                  class="media"
                />
              </div>
            </div>
          </div>

          <div class="olympia-base-bar">
            <div class="wood-slider"></div>
            <div class="question-tag">CÂU {{ state.speedup.currentQuestion.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="state.speedup.showAnswers" class="answer-overlay">
      <div class="olympia-answer-list">
        <div v-for="player in sortedPlayers" :key="player.id" class="olympia-answer-item">
          <div class="olympia-time">{{ getPlayerTime(player.socketId) }}</div>
          <div class="olympia-dot"></div>
          <div class="olympia-name-ans">
            <div class="olympia-name">{{ player.name }}</div>
            <div class="olympia-answer-text">{{ getPlayerAnswer(player.socketId) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from "vue"
import { state } from "../socket"

const videoRef = ref(null)
const videoBlobUrl = ref("")
const isVideoLoading = ref(false)
const progress = ref(0)
let timer = null

/**
 * HÀM CỐT LÕI: Tải video từ thư mục public vào bộ nhớ RAM
 * Giúp triệt tiêu lag khi share screen qua TV
 */
async function preloadVideoToRAM(filename) {
  if (!filename) return;
  
  isVideoLoading.value = true;
  try {
    // Đường dẫn nội bộ trong thư mục public
    const path = `/media/${filename}`;
    
    const response = await fetch(path);
    if (!response.ok) throw new Error("Không tìm thấy video");
    
    const blob = await response.blob();
    
    // Giải phóng bộ nhớ cũ (quan trọng để không bị tràn RAM)
    if (videoBlobUrl.value) URL.revokeObjectURL(videoBlobUrl.value);
    
    videoBlobUrl.value = URL.createObjectURL(blob);
    
    if (videoRef.value) {
      videoRef.value.load(); // Chuẩn bị sẵn sàng các buffer
    }
    console.log(`[Hệ thống] Đã nạp thành công ${filename} vào RAM.`);
  } catch (error) {
    console.error("[Lỗi Hệ thống] Không thể nạp video:", error);
  } finally {
    isVideoLoading.value = false;
  }
}

// Theo dõi câu hỏi mới để nạp trước (Preload)
const isReadyToPlay = ref(false); // Biến kiểm soát trạng thái sẵn sàng

// 1. Theo dõi câu hỏi mới để nạp trước (Preload)
watch(
  () => state.speedup.currentQuestion,
  async (q) => {
    if (q?.type === "video" && q.src) {
      isReadyToPlay.value = false; // Reset trạng thái khi sang câu mới
      const fileName = q.src.split('/').pop(); // Lấy tên file từ đường dẫn
      await preloadVideoToRAM(fileName);
      isReadyToPlay.value = true;  // Đánh dấu đã nạp xong vào RAM
    }
  },
  { immediate: true }
)

// 2. Theo dõi lệnh bắt đầu (MC bấm nút)
watch(
  () => state.speedup.startAt,
  async (startAt) => {
    // Chỉ chạy nếu startAt có giá trị VÀ video đã nạp xong
    if (startAt && videoRef.value && videoBlobUrl.value) {
      try {
        // Đảm bảo video ở trạng thái dừng và về đầu trước khi phát
        videoRef.value.pause();
        videoRef.value.currentTime = 0;

        // Chờ một nhịp nhỏ để trình duyệt cập nhật DOM (Next Tick)
        await nextTick();

        // Kiểm tra nếu video đã sẵn sàng phát
        if (isReadyToPlay.value) {
          const duration = videoRef.value.duration;
              if (duration > 0) {
                // Nếu video dài hơn 30s, tăng tốc. Nếu ngắn hơn, giữ 1x hoặc giảm tốc tùy bạn.
                const targetTime = 30;
                videoRef.value.playbackRate = duration / targetTime;
                console.log(`[Hệ thống] Tốc độ video: ${videoRef.value.playbackRate.toFixed(2)}x`);
              }          
          await videoRef.value.play();
        } else {
          console.warn("Video chưa nạp xong RAM, đang đợi...");
          // Đợi đến khi nạp xong rồi mới phát
          const unwatch = watch(isReadyToPlay, async (ready) => {
            if (ready) {
              await videoRef.value.play();
              unwatch(); // Hủy watch sau khi đã phát
            }
          });
        }
      } catch (e) {
        // Tránh log lỗi AbortError gây nhiễu console nếu không cần thiết
        if (e.name !== 'AbortError') {
          console.error("Lỗi phát video thực sự:", e);
        }
      }
    }
  }
)

function onVideoEnded() { 
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = videoRef.value.duration;
  } 
}

function updateProgress() {
  if (!state.speedup.startAt) { progress.value = 0; return }
  const elapsed = (Date.now() - state.speedup.startAt) / 1000
  // Thời gian Tăng tốc mặc định là 30s
  progress.value = Math.min((elapsed / 30) * 100, 100)
}

onMounted(() => { 
  timer = setInterval(updateProgress, 50) 
})

onUnmounted(() => { 
  if (timer) clearInterval(timer);
  // Giải phóng RAM khi thoát màn hình thi
  if (videoBlobUrl.value) URL.revokeObjectURL(videoBlobUrl.value);
})

// XỬ LÝ ĐÁP ÁN
const sortedPlayers = computed(() => {
  if (!state.players) return []
  return [...state.players].map(p => ({
    ...p,
    time: state.speedup.answers?.[p.socketId]?.time ?? 0
  })).sort((a, b) => a.time - b.time)
})

function getPlayerTime(id) { 
  return state.speedup.answers?.[id]?.time?.toFixed(2) || '0.00' 
}

function getPlayerAnswer(id) { 
  return state.speedup.answers?.[id]?.answer || '' 
}
</script>
<style scoped>

/* Định nghĩa biến để dễ quản lý chiều cao đồng bộ */

:root {

  --olympia-height: 550px;

}



.speedup-root {

  width: 100vw;

  height: 100vh;

  position: relative;

  perspective: 2500px;

  overflow: hidden;

  display: flex;

  justify-content: center;

}



.olympia-container {

  position: absolute;

  bottom: 100px;

  display: flex;

  justify-content: center;

  width: 100%;

}



.olympia-layout {

  display: flex;

  align-items: flex-end;

  gap: 20px;

}



.main-content-area {

  display: flex;

  flex-direction: column;

  height: 100%;

  width: 100%;

  margin: 0 auto;

  flex: 1;

}



/* THANH NGANG ĐẾ */

.olympia-base-bar {

  position: relative;

  width: 100%;

  height: 45px;

  background: #000;

  border-top: 1px solid #444;

  box-shadow: 0 20px 40px rgba(0,0,0,0.6);

  z-index: 10;

}



.wood-slider {

  position: absolute;

  top: 0;

  right: 150px;

  width: calc(100% - 150px);

  height: 16px;

  background: linear-gradient(to bottom, #8b4513, #4d260b);

  animation: slideInWood 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;

}



.question-tag {

  position: absolute;

  right: 0;

  width: 150px;

  height: 100%;

  background: #f1c40f;

  color: #000;

  font-weight: 900;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 1.4rem;

}



/* KHUNG MEDIA CỐ ĐỊNH CHIỀU CAO */

.media-unfold-wrapper {

  transform-origin: bottom;

  transform: rotateX(-90deg);

  opacity: 0;

  animation: unfold3D 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  animation-delay: 0.5s;

}



.media-box {

  width: 100%;

  height: 100%; /* Media chiếm 80% main-content-area */

  background: rgba(0, 0, 0, 0.95);

  border: 1px solid #333;

  padding: 15px;

  box-sizing: border-box;

  display: flex;

  flex-direction: column;

  justify-content: flex-start;

}



.media-wrapper {

  flex: 1;

  width: 100%;

  height: 100%;

  min-width: 80vw;

  min-height: 63vh;

  background: #000;

  display: flex;

  align-items: center;

  justify-content: center;

  overflow: hidden;

}



.media {

  max-width: 100%;

  width: 80vw;

  height: 60vh;

  max-height: 100%;

  object-fit: contain;

}



.question-text {

  color: #fff;

  font-size: 1.6rem;

  margin-bottom: 15px;

  text-align: center;

  min-height: 2.4rem; /* Giữ chỗ cho text */

}



/* TIMER DỰNG ĐỨNG */

.timer-unfold-wrapper {

  transform-origin: bottom;

  transform: rotateX(-90deg);

  opacity: 0;

  height: 100%;

  animation: unfold3D 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  animation-delay: 0.8s;

}



.timer-vertical {

  width: 40px;

  /* CỐ ĐỊNH: Chiều cao chuẩn */

  height: 100%;

  background: #000;

  border: 1px solid #333;

  display: flex;

  flex-direction: column-reverse;

}



.timer-vertical .fill {

  width: 100%;

  background: linear-gradient(to top, #00ff88, #008855);

}



@keyframes unfold3D {

  0% { transform: rotateX(-90deg); opacity: 0; }

  100% { transform: rotateX(0deg); opacity: 1; }

}



@keyframes slideInWood {

  0% { transform: translateX(100%); }

  100% { transform: translateX(0); }

}



/* Container chính bao phủ toàn màn hình */

.answer-overlay {

  position: fixed;

  top: 0;

  left: 0;

  width: 100%;

  height: 100%;

  background: rgba(0, 0, 0, 0.7); /* Làm tối nền để nổi bật câu trả lời */

  display: flex;

  justify-content: center;

  align-items: center;

  z-index: 9999;

}



/* Danh sách các câu trả lời */

.olympia-answer-list {

  display: flex;

  flex-direction: column;

  gap: 15px; /* Khoảng cách giữa các hàng */

  width: 80%;

  max-width: 600px;

}



/* Hiệu ứng rơi cho từng item */

.olympia-answer-item {

  display: flex;

  align-items: center;

  background: linear-gradient(90deg, #1a2a6c, #b21f1f); /* Màu gradient đặc trưng */

  border: 2px solid #fff;

  border-radius: 10px;

  padding: 10px 20px;

  color: white;

 

  /* Animation rơi */

  animation: dropIn 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

}



/* Tạo độ trễ (delay) cho từng người chơi để rơi lần lượt */

.olympia-answer-item:nth-child(1) { animation-delay: 0.1s; }

.olympia-answer-item:nth-child(2) { animation-delay: 0.4s; }

.olympia-answer-item:nth-child(3) { animation-delay: 0.7s; }

.olympia-answer-item:nth-child(4) { animation-delay: 1.0s; }



/* Định nghĩa Keyframes */

@keyframes dropIn {

  0% {

    transform: translateY(120vh); /* Bắt đầu từ ngoài phía trên màn hình */

    opacity: 0;

  }

  100% {

    transform: translateY(0); /* Dừng lại ở vị trí tự nhiên trong flexbox (giữa màn hình) */

    opacity: 1;

  }

}



/* Styling các thành phần bên trong cho giống Olympia */

.olympia-time {

  font-weight: bold;

  font-size: 1.2rem;

  margin-right: 15px;

  min-width: 60px;

}



.olympia-dot {

  width: 10px;

  height: 10px;

  background: #ffd700;

  border-radius: 50%;

  margin-right: 15px;

}



.olympia-name {

  font-size: 0.9rem;

  text-transform: uppercase;

  color: #ddd;

}



.olympia-answer-text {

  font-size: 1.3rem;

  font-weight: bold;

}

</style>