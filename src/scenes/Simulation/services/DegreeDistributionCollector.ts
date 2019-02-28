import { ReplaySubject, Subject, Subscription, interval } from 'rxjs'

import { ReadGraph, Change, VertexId } from 'graph'
import { buffer } from 'rxjs/operators'

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

class DegreeDistributionCollector {
  private graph: ReadGraph
  private subscription: Subscription
  private distribution: number[] = []
  private distributionSubject: Subject<number[]> = new ReplaySubject(1)
  private degrees: Map<VertexId, number> = new Map()

  public distribution$ = this.distributionSubject.asObservable()

  constructor(graph: ReadGraph) {
    this.graph = graph
    this.subscription = this.graph.change$
      .pipe(buffer(interval(500)))
      .subscribe(this.onGraphEvents)
  }

  public destroy() {
    this.subscription.unsubscribe()
  }

  private onGraphEvents = (changes: Change[]) => {
    changes.forEach(this.processEvent)
    this.distributionSubject.next(this.distribution)
  }

  private processEvent = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        this.degrees.set(change.id, 0)
        changeDist(this.distribution, 0, 1)
        break
      case 'AddedEdge':
        const [v1, v2] = this.graph.edges[change.id]
        const d1 = this.degrees.get(v1)!
        const d2 = this.degrees.get(v2)!

        changeDist(this.distribution, d1, -1)
        changeDist(this.distribution, d1 + 1, +1)
        this.degrees.set(v1, d1 + 1)

        if (v1 !== v2) {
          changeDist(this.distribution, d2, -1)
          changeDist(this.distribution, d2 + 1, +1)
          this.degrees.set(v2, d2 + 1)
        }
        break
      default:
    }
  }
}

export default DegreeDistributionCollector
