import { ReplaySubject } from 'rxjs'

import tutorial from 'examples/tutorial.lua'

import SimulationError from 'model/SimulationError'
import SimulationState from 'model/SimulationState'

export default class AppState {
  private codeSubject = new ReplaySubject<string>(1)
  private simulationStateSubject = new ReplaySubject<
    SimulationState | undefined
  >(1)
  private lastErrorSubject = new ReplaySubject<SimulationError | undefined>(1)
  private code: string
  private simulationState?: SimulationState
  public readonly code$ = this.codeSubject.asObservable()
  public readonly simulationState$ = this.simulationStateSubject.asObservable()
  public readonly lastError$ = this.lastErrorSubject.asObservable()
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
    if (this.simulationState) {
      this.simulationState.destroy()
    }
    this.simulationState = undefined
    this.simulationStateSubject.next(undefined)
  }
  public run = () => {
    this.stop()
    this.simulationState = new SimulationState(this.code, this.onError)
    this.simulationStateSubject.next(this.simulationState)
  }
  private onError = (error: SimulationError) => {
    this.simulationStateSubject.next(undefined)
    this.lastErrorSubject.next(error)
  }
}
