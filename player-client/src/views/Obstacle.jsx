import { useState } from "react"
import "./Obstacle.css"
export default function ObstaclePlayer({ state, playerId ,socket}) {
  const [input, setInput] = useState("")
  const [submittedAnswer, setSubmittedAnswer] = useState("")

  if (!state || !state.rows) return null

  const locked = state.locked

  function handleSubmit(e) {
    e.preventDefault()
    if (!state.timer || locked) return

    socket.emit("player:answerRow", input)
    setSubmittedAnswer(input)
  }

  function buzzObstacle() {
    if (locked) return
    socket.emit("player:buzzObstacle")
  }

  return (
    <div className="obstacle-player">
      {/* Timer circle at right */}
      <div className="timer-circle-floating">
        {state.timer}
      </div>
      <h1>VƯỢT CHƯỚNG NGẠI VẬT</h1>

      {/* 4 hàng ngang dạng tròn */}
      <div className="rows-circle">
        {state.rows.map((row) => (
          <div
            key={row.id}
            className={`row-circle-group ${
              row.disabled ? "disabled" : ""
            }`}
          >
            {Array.from({ length: row.numberOfChars }).map((_, idx) => (
              <span
                key={idx}
                className={[
                  "row-circle-char",
                  state.currentRow == row.id ? "active" : "",
                  row.disabled ? "disabled" : "",
                  row.revealed ? "revealed" : ""
                ].join(" ")}
              >
                {row.answer ? row.answer[idx] : ""}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Image overlay */}
      <div className="image-grid-overlay">
        {state.image.parts.map((part, i) => (
          <div
            key={i}
            className={`corner-box ${
              part.revealed ? "revealed" : ""
            } ${
              i === 0
                ? "corner-tl"
                : i === 1
                ? "corner-tr"
                : i === 2
                ? "corner-bl"
                : "corner-br"
            }`}
          >
            {part.revealed ? "MỞ" : "?"}
          </div>
        ))}

        <div className="center-box-overlay">
          TRUNG TÂM
        </div>
      </div>

      {/* Buzz */}
      <button
        className="buzz-btn"
        disabled={locked || state.buzzPlayer == playerId}
        onClick={buzzObstacle}
      >
        🔔 BẤM CHUÔNG
      </button>

      {/* Ô nhập đáp án */}
      <div className="answer-section">
        <div className="submitted-line">
          Đáp án đã nhập: {submittedAnswer}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            disabled={!state.timer || locked}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập đáp án..."
          />
        </form>
      </div>

      {locked && (
        <div className="locked-overlay">
          BẠN ĐÃ BỊ KHÓA
        </div>
      )}
    </div>
  )
}
