import { useEffect, useState } from "react"
import "./Speedup.css"
export default function Speedup({state,playerId,socket}) {
  const [input, setInput] = useState("")

  if (!state?.speed) return null

  const running = state.speed.running
  const locked = state.speed.locked

  function handleSubmit(e) {
    e.preventDefault()
    if (!running) return
    socket.emit("player:speedAnswer", input)
  }

  return (
    <div className="speed-player">

      <div className="image-area">
        {state.speed.currentQuestion && (
          <div className="question-text">
            {state.speed.currentQuestion.text}
          </div>
        )}
      </div>

      <div className="timer-bar">
        <div
          className="timer-fill"
          style={{
            height: `${(state.speed.timer / 30) * 100}%`
          }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <input
          disabled={!running || locked}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập đáp án..."
        />
      </form>

    </div>
  )
}
