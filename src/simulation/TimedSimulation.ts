import { SimulationError } from './SimulationError'
import { ReadGraph } from 'graph'
import { Subject, ReplaySubject } from 'rxjs'
import Timer from 'Timer'
import { LuaSimulation } from 'simulation'

type ErrorCallback = (error: SimulationError) => void

export class TimedSimulation {
  public graph: ReadGraph
  public paused$: Subject<boolean> = new ReplaySubject(1)
  public speed$: Subject<number> = new ReplaySubject(1)

  private timer: Timer
  private simulation: LuaSimulation
  private onError: ErrorCallback

  constructor(code: string, onError: ErrorCallback) {
    const initialSpeed = 0
    this.onError = onError

    this.timer = new Timer(initialSpeed, this.tick)
    this.simulation = new LuaSimulation(code)
    this.graph = this.simulation.graph
    this.paused$.next(true)
    this.speed$.next(initialSpeed)
  }

  public pause = () => {
    this.timer.pause()
    this.paused$.next(this.timer.isPaused())
  }

  public play = () => {
    this.timer.play()
    this.paused$.next(this.timer.isPaused())
  }

  public destroy() {
    this.timer.destroy()
  }

  public setSpeed = (speed: number) => {
    this.timer.setSpeed(speed)
    this.speed$.next(speed)
  }

  private tick = () => {
    const result = this.simulation.tick()
    switch (result.type) {
      case 'failed':
        this.pause()
        this.onError(result.error)
        break
      case 'ended':
        this.pause()
        break
      default:
    }
  }
}
