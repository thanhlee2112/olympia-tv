import AnswerButton from "./AnswerButton"
import TimerBar from "./TimerBar"

export default function QuestionBoard({ state }) {
  return (
    <div className="board">
      <div className="question">
        {state.question?.text || "Chờ MC bắt đầu..."}
      </div>

      <TimerBar time={state.timeLeft} />

      <div className="answers">
        {state.question?.answers.map((a) => (
          <AnswerButton
            key={a.key}
            answer={a}
            state={state}
          />
        ))}
      </div>
    </div>
  )
}
