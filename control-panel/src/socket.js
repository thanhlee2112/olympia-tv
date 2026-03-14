import { reactive } from "vue"
import { io } from "socket.io-client"

export const socket = io("http://192.168.0.103:3000",{
  auth: {
    role: "mc"
  }
})

export const state = reactive({
  phase: "dashboard",
  players: [],
  timer: 60,
  kickoff: {},
  obstacle: {},
  currentPlayer: null
})

socket.on("state:update", (serverState) => {
  Object.assign(state, serverState)
})

export function setPhase(phase) {
  socket.emit("mc:setPhase", phase)
}

export function startKickoff(playerId) {
  socket.emit("mc:startKickoff", { playerId })
}

export function answer(correct) {
  socket.emit("mc:answer", correct)
}

export function showQuestion() {
  socket.emit("mc:showQuestion")
}
