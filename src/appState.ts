import { Observable, ReplaySubject } from 'rxjs'
import { SimulationError, TimedSimulation } from 'simulation'
import tutorial from 'examples/tutorial.lua'
import LocalStorageFileSystem from 'browserfs/dist/node/backend/LocalStorage'

LocalStorageFileSystem.Create({}, (e, lfs) => {
  window['fs'] = lfs
})

export interface IAppState {
  readonly code$: Observable<string>
  readonly runningSimulation$: Observable<TimedSimulation | undefined>
  readonly lastError$: Observable<SimulationError | undefined>
  readonly setCode: (code: string) => void
  readonly run: () => void
  readonly stop: () => void
}

class AppState implements IAppState {
  private codeSubject = new ReplaySubject<string>(1)
  private runningSimulationSubject = new ReplaySubject<
    TimedSimulation | undefined
  >(1)
  private lastErrorSubject = new ReplaySubject<SimulationError | undefined>(1)

  public code$ = this.codeSubject.asObservable()
  public runningSimulation$ = this.runningSimulationSubject.asObservable()
  public lastError$ = this.lastErrorSubject.asObservable()

  private code: string
  private simulation?: TimedSimulation

  constructor() {
    fetch(tutorial)
      .then(r => r.text())
      .then((code: string) => this.setCode(code))
  }

  public setCode = (code: string) => {
    this.lastErrorSubject.next(undefined)
    this.code = code
    this.codeSubject.next(code)
  }

  public stop = () => {
    if (this.simulation) {
      this.simulation.destroy()
    }
    this.runningSimulationSubject.next(undefined)
  }

  public run = () => {
    this.stop()
    this.simulation = new TimedSimulation(this.code, this.onError)
    this.simulation.play()
    this.runningSimulationSubject.next(this.simulation)
  }

  private onError = (error: SimulationError) => {
    this.runningSimulationSubject.next(undefined)
    this.lastErrorSubject.next(error)
  }
}

export const appState: IAppState = new AppState()
