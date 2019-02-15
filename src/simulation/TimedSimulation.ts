import { SimulationError } from './SimulationError'
import { ReadGraph, AdjacencyListGraph } from 'graph'
import { Subject, ReplaySubject } from 'rxjs'
import Timer from './Timer'
import luaSimulation from './luaSimulation'

type ErrorCallback = (error: SimulationError) => void

export default class TimedSimulation {
  public graph: ReadGraph
  public paused$: Subject<boolean> = new ReplaySubject(1)
  public speed$: Subject<number> = new ReplaySubject(1)

  private timer: Timer
  private iterator: IterableIterator<void | SimulationError>
  private onError: ErrorCallback

  constructor(code: string, onError: ErrorCallback) {
    const initialSpeed = 0
    this.onError = onError

    const graph = new AdjacencyListGraph()
    this.graph = graph
    this.iterator = luaSimulation(code, graph)

    this.timer = new Timer(initialSpeed, this.tick)

    this.paused$.next(this.timer.isPaused())
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
    const result = this.iterator.next()

    if (result.done) {
      this.pause()
    }

    // If returned anything, than it is an error
    if (result.value) {
      this.onError(result.value)
    }
  }
}
