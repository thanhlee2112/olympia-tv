
import { io } from "socket.io-client"
import { reactive } from "vue";

const socket = io("http://10.16.31.80:3000", {
  auth: {
    role: "public",
  },
});
export const state = reactive({
  players: [],
  phase: "dashboard",
  obstacle: {},
  speedup: {},
  final: {}
})

socket.on("state:update", (newState) => {
  Object.assign(state, newState)
})