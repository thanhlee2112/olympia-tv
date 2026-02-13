import { useEffect, useState, useRef } from "react"
import "./Speedup.css"

export default function Speedup({ state, playerId, socket }) {
  const [input, setInput] = useState("")
  const [localTime, setLocalTime] = useState(0)

  const intervalRef = useRef(null)
  const videoRef = useRef(null)

  const question = state?.currentQuestion
  const running = state?.running
  const duration = question?.duration || 30

  /* =========================
     RESET KHI CÂU HỎI MỚI
  ========================== */
  useEffect(() => {
    setInput("")
    setLocalTime(0)

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.load() // preload lại
    }
  }, [question])

  /* =========================
     PLAY VIDEO KHI RUNNING
  ========================== */
  useEffect(() => {
    if (!question) return
    if (question.type !== "video") return
    if (!videoRef.current) return

    if (running) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }

  }, [running])

  /* =========================
     TIMER SYNC SERVER
  ========================== */
  useEffect(() => {
    if (!state?.startAt || !running) {
      clearInterval(intervalRef.current)
      return
    }

    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      const elapsed =
        (Date.now() - state.startAt) / 1000

      setLocalTime(Math.min(elapsed, duration))

      if (elapsed >= duration) {
        clearInterval(intervalRef.current)
      }

    }, 20)

    return () => clearInterval(intervalRef.current)

  }, [state?.startAt, running])

  if (!question) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!running) return
    if (!input.trim()) return

    socket.emit("player:speedAnswer", {
      playerId,
      answer: input.trim(),
      time: Number(localTime.toFixed(2))
    })

    setInput("")
  }

  return (
    <div className="speed-player">

      {/* ===== TEXT TRÊN ===== */}
      <div className="question">
        {question.text}
      </div>

      {/* ===== MEDIA ===== */}
      {question.type === "image" && (
        <img
          className="media"
          src={question.src}
          alt="question"
        />
      )}

      {question.type === "video" && (
        <video
          ref={videoRef}
          className="media"
          preload="auto"
          controls={false}
        >
          <source
            src={question.src}
            type="video/mp4"
          />
        </video>
      )}

      {/* ===== INPUT ===== */}
      <form onSubmit={handleSubmit}>
        <input
          disabled={!running}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập đáp án..."
        />
      </form>

      {/* ===== TIMER BAR ===== */}
      <div className="timer-bar">
        <div
          className="fill"
          style={{
            width: `${(localTime / duration) * 100}%`
          }}
        />
      </div>

      <div className="time-display">
        {localTime.toFixed(2)}s
      </div>

    </div>
  )
}
