
import { io } from "socket.io-client"
import { reactive } from "vue";

export const socket = io("http://192.168.0.183:3000", {
  auth: {
    role: "public",
  },
});
export const state = reactive({
  players: [],
  phase: "dashboard",
  obstacle: {},
  speedup: {},
  final: {},
  scoreboard:{
    revealed: []
  },
  summarizingScores: false,
})

socket.on("state:update", (newState) => {
  Object.assign(state, newState)
})