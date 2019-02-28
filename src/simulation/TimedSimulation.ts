import { SimulationError } from './SimulationError'
import { ReadGraph, AdjacencyListGraph } from 'graph'
import { Subject, ReplaySubject } from 'rxjs'
import Timer from './Timer'
import luaSimulation from './luaSimulation'

type ErrorCallback = (error: SimulationError) => void

export default class TimedSimulation {
  private pausedSubject: Subject<boolean> = new ReplaySubject(1)
  private speedSubject: Subject<number> = new ReplaySubject(1)
  private tickSubject: Subject<void | SimulationError> = new Subject()

  public graph: ReadGraph
  public paused$ = this.pausedSubject.asObservable()
  public speed$ = this.speedSubject.asObservable()
  public tick$ = this.tickSubject.asObservable()

  private timer: Timer
  private iterator: IterableIterator<void | SimulationError>
  private onError: ErrorCallback

  constructor(code: string, onError: ErrorCallback) {
    const initialSpeed = 1
    this.onError = onError

    const graph = new AdjacencyListGraph()
    this.graph = graph
    this.iterator = luaSimulation(code, graph)

    this.timer = new Timer(initialSpeed, this.tick)

    this.pausedSubject.next(this.timer.isPaused())
    this.speedSubject.next(initialSpeed)
  }

  public pause = () => {
    this.timer.pause()
    this.pausedSubject.next(this.timer.isPaused())
  }

  public play = () => {
    this.timer.play()
    this.pausedSubject.next(this.timer.isPaused())
  }

  public destroy() {
    this.timer.destroy()
  }

  public setSpeed = (speed: number) => {
    this.timer.setSpeed(speed)
    this.speedSubject.next(speed)
  }

  private tick = () => {
    const result = this.iterator.next()

    // Publish tick event, so other's can sync with tick event
    this.tickSubject.next(result.value)

    if (result.done) {
      this.pause()
    }

    // If returned anything, than it is an error
    if (result.value) {
      this.onError(result.value)
    }
  }
}
