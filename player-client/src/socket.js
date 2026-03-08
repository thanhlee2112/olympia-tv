
import { io } from "socket.io-client"

// Only access window in browser-like environments
let token = null;
if (typeof window !== "undefined") {
  token = new URLSearchParams(window.location.search).get("token");
}

const socket = io("http://192.168.0.183:3000", {
  auth: {
    role: "player",
    token: token,
  },
});

function buzz() {
  socket.emit("player:buzz");
}

function answer(ans) {
  socket.emit("player:answer", ans);
}

export default socket;
export { buzz, answer };