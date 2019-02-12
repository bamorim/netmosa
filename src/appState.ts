import { Observable, ReplaySubject } from 'rxjs'
import { SimulationError, TimedSimulation } from 'simulation'
import tutorial from 'examples/tutorial.lua'

export interface IAppState {
  readonly code$: Observable<string>
  readonly runningSimulation$: Observable<TimedSimulation | undefined>
  readonly lastError$: Observable<SimulationError | undefined>
  readonly setCode: (code: string) => void
  readonly run: () => void
  readonly stop: () => void
}

class AppState implements IAppState {
  public code$ = new ReplaySubject<string>(1)
  public runningSimulation$ = new ReplaySubject<TimedSimulation | undefined>(1)
  public lastError$ = new ReplaySubject<SimulationError | undefined>(1)

  private code: string
  private simulation?: TimedSimulation

  constructor() {
    fetch(tutorial)
      .then(r => r.text())
      .then((code: string) => this.setCode(code))
  }

  public setCode = (code: string) => {
    this.lastError$.next(undefined)
    this.code = code
    this.code$.next(code)
  }

  public stop = () => {
    if (this.simulation) {
      this.simulation.destroy()
    }
    this.runningSimulation$.next(undefined)
  }

  public run = () => {
    this.stop()
    this.simulation = new TimedSimulation(this.code, this.onError)
    this.simulation.play()
    this.runningSimulation$.next(this.simulation)
  }

  private onError = (error: SimulationError) => {
    this.runningSimulation$.next(undefined)
    this.lastError$.next(error)
  }
}

export const appState: IAppState = new AppState()
