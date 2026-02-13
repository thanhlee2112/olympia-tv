import socket from "../socket"
import './Final.css'
export default function Final({ state, playerId, socket }) {
  if (!state?.phase === "VeDich") return null;
  console.log(state.buzzWindow);
  
  const canBuzz =
    state.buzzWindow &&
    state.activePlayer !== socket.id;
  const showContent = state.showContent;
  return (
    <div className="final-container">
      <h1>VỀ ĐÍCH</h1>
      {showContent && (
      <div className="final-question">
        {state.question}
      </div>
      )}
      <div className="final-players">
        {state.players.map((p) => (
          <div className="final-player" key={p.id}>
            <span>{p.name}</span>
            <span>{p.score}</span>
          </div>
        ))}
      </div>

      {canBuzz && (
        <button
          className="final-buzz-btn"
          onClick={() => socket.emit("player:finalBuzz")}
        >
          BẤM CHUÔNG
        </button>
      )}
    </div>
  );
}
