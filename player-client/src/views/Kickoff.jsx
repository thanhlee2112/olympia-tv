
import React from "react"
import "./Kickoff.css"

export default function Kickoff({ state }) {

  if (!state) return null

  return (
    <div className="kickoff-player">
      <h2>PHẦN KHỞI ĐỘNG</h2>

      {!state.isActive && <h3>Chờ tới lượt...</h3>}

      {state.isActive && (
        <>
          <h3>Thời gian: {state.timer}</h3>

          {state.currentQuestion && (
            <p>
              Câu {state.currentQuestion.number}:{" "}
              {state.currentQuestion.question}
            </p>
          )}
        </>
      )}
    </div>
  )
}

