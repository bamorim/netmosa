import { useState } from 'react'
import Timer from 'Timer'

const useTimer = (initialSpeed: number, callback: () => void) => {
  const [timer] = useState(new Timer(initialSpeed, callback))
  const [speed, setSpeed] = useState(initialSpeed)
  const [paused, setPaused] = useState(timer.isPaused())

  const play = () => {
    timer.play()
    setPaused(timer.isPaused())
  }

  const pause = () => {
    timer.pause()
    setPaused(timer.isPaused())
  }

  return { play, pause, setSpeed, speed, paused }
}

export default useTimer
