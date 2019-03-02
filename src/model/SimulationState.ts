import { ReplaySubject } from 'rxjs'
import DegreeDistributionCollector from 'model/DegreeDistributionCollector'
import DistanceToRootDistributionCollector from 'model/DistanceToRootDistributionCollector'
import TimedSimulation, { ErrorCallback } from 'model/TimedSimulation'

export default class SimulationState {
  private autozoomEnabledSubject = new ReplaySubject<boolean>(1)
  private autozoomEnabled: boolean

  public readonly simulation: TimedSimulation
  public readonly degreeDistributionCollector: DegreeDistributionCollector
  public readonly distanceToRootDistributionCollector: DistanceToRootDistributionCollector
  public readonly autozoomEnabled$ = this.autozoomEnabledSubject.asObservable()

  constructor(code: string, onError: ErrorCallback) {
    this.setAutozoomEnabled(true)
    this.simulation = new TimedSimulation(code, onError)
  }

  public setAutozoomEnabled = (autozoomEnabled: boolean) => {
    if (this.autozoomEnabled !== autozoomEnabled) {
      this.autozoomEnabled = autozoomEnabled
      this.autozoomEnabledSubject.next(autozoomEnabled)
    }
  }

  public destroy() {
    this.simulation.destroy()
    this.degreeDistributionCollector.destroy()
    this.distanceToRootDistributionCollector.destroy()
  }
}
