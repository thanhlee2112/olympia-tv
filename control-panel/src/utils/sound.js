const sounds = {
  KhoiDong: new Audio("/sounds/start_kickoff.mp3"),
  ChuongNgaiVat: new Audio("/sounds/start_obstacle.mp3"),
  TangToc: new Audio("/sounds/start_speedup.mp3"),
  VeDich: new Audio("/sounds/start_final.mp3")
}

export function playPhaseSound(phase) {
  const audio = sounds[phase]
  console.log(audio);
  if (!audio) return

  audio.currentTime = 0
  audio.play().catch(() => {})
}
