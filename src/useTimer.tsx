import { useState } from 'react'
import Timer from 'Timer'

const useTimer = (initialSpeed: number, callback: () => void) => {
  const [timer] = useState(new Timer(initialSpeed, callback))
  const [paused, setPaused] = useState(timer.isPaused())

  const play = () => {
    timer.play()
    setPaused(timer.isPaused())
  }

  const pause = () => {
    timer.pause()
    setPaused(timer.isPaused())
  }

  const setSpeed = (speed: number) => {
    timer.setSpeed(speed)
  }

  return { play, pause, setSpeed, paused }
}

export default useTimer
