import { useEffect, useState } from "react"
import { socket } from "./socket"
import QuestionBoard from "./components/QuestionBoard"

export default function App() {
  const [state, setState] = useState(null)

  useEffect(() => {
    socket.on("state:update", (data) => {
      setState(data)
    })
  }, [])

  if (!state) return <div className="loading">Waiting for MC...</div>

  return (
    <div className="stage">
      <QuestionBoard state={state} />
    </div>
  )
}
