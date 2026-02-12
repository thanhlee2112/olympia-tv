import { io } from "socket.io-client"
const token = new URLSearchParams(window.location.search).get("token")

const socket = io("http://10.16.31.80:3000", {
  auth: {
    role: "player",
    token: token,
  },
})


function buzz() {
  socket.emit("player:buzz")
}

function answer(ans) {
  socket.emit("player:answer", ans)
}
export default socket;
export { buzz, answer }