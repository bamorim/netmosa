import { ReplaySubject } from 'rxjs'
import { SimulationError, TimedSimulation } from 'simulation'
import tutorial from 'examples/tutorial.lua'

export class AppState {
  private codeSubject = new ReplaySubject<string>(1)
  private runningSimulationSubject = new ReplaySubject<
    TimedSimulation | undefined
  >(1)
  private lastErrorSubject = new ReplaySubject<SimulationError | undefined>(1)
  private autozoomEnabledSubject = new ReplaySubject<boolean>(1)

  private code: string
  private simulation?: TimedSimulation
  private autozoomEnabled: boolean

  public readonly code$ = this.codeSubject.asObservable()
  public readonly runningSimulation$ = this.runningSimulationSubject.asObservable()
  public readonly lastError$ = this.lastErrorSubject.asObservable()
  public readonly autozoomEnabled$ = this.autozoomEnabledSubject.asObservable()

  constructor() {
    this.setAutozoomEnabled(true)
    fetch(tutorial)
      .then(r => r.text())
      .then((code: string) => this.setCode(code))
  }

  public setAutozoomEnabled = (autozoomEnabled: boolean) => {
    if (this.autozoomEnabled !== autozoomEnabled) {
      this.autozoomEnabled = autozoomEnabled
      this.autozoomEnabledSubject.next(autozoomEnabled)
    }
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
    this.setAutozoomEnabled(true)
    this.simulation = new TimedSimulation(this.code, this.onError)
    this.simulation.play()
    this.runningSimulationSubject.next(this.simulation)
  }

  private onError = (error: SimulationError) => {
    this.runningSimulationSubject.next(undefined)
    this.lastErrorSubject.next(error)
  }
}

export const appState = new AppState()
