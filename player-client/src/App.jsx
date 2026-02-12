import React, { useEffect, useState } from "react"
import socket from "./socket"
import Kickoff from "./views/Kickoff"
import Obstacle from "./views/Obstacle"
import Speedup from "./views/Speedup"
function App() {
  const [state, setState] = useState(null)
  const [playerId, setPlayerId] = useState(null)

  useEffect(() => {
    socket.on("state:update", (gameState) => {
      setState({ ...gameState })
    })

    socket.on("player:info", ({ id }) => {
      setPlayerId(id)
    })

    return () => {
      socket.off("state:update")
      socket.off("player:info")
    }
  }, [])
  console.log(state);
  
  if (!state) return <div>Loading...</div>

  if (state.phase === "KhoiDong") {
    return <Kickoff state={state} playerId={playerId} />
  }
  if(state.phase === "ChuongNgaiVat"){
    return <Obstacle state={state} playerId={playerId} socket={socket} />
  }
  if(state.phase === "TangToc"){
    return <Speedup state={state} playerId={playerId} socket={socket}/>
  }
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
      color: '#fff',
      borderRadius: '18px',
      boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
      padding: '2rem',
      maxWidth: '320px',
      margin: '10vh auto',
      textAlign: 'center',
      border: '2px solid #21a1f3',
      fontSize: '1.2rem'
    }}>
      <div style={{fontWeight:'bold',fontSize:'1.5rem',marginBottom:'1rem'}}>Chờ tới lượt...</div>
      <div>Tên: {state.name || '...'}</div>
      <div>Điểm: {state.score ?? 0}</div>
    </div>
  )
}

export default App
