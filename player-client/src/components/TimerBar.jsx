export default function TimerBar({ time }) {

  return (
    <div className="timer-container">
      <div
        className="timer-bar"
        style={{ width: `${time}%` }}
      />
    </div>
  )
}
