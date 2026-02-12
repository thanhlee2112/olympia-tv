import { socket } from "../socket"
import { useEffect } from "react"

export default function AnswerButton({ answer, state }) {

  const locked = state.locked
  const correct = state.correctAnswer

  const isCorrect = correct === answer.key
  const isWrong = correct && correct !== answer.key

  const handleClick = () => {
    if (!locked) {
      socket.emit("contestant:answer", answer.key)
      new Audio("/assets/tick.mp3").play()
    }
  }

  return (
    <div
      className={`
        answer 
        ${locked ? "locked" : ""}
        ${isCorrect ? "correct" : ""}
        ${isWrong ? "wrong" : ""}
      `}
      onClick={handleClick}
    >
      <span className="key">{answer.key}</span>
      <span>{answer.text}</span>
    </div>
  )
}
