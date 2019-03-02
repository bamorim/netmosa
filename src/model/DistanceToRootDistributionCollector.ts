import { ReplaySubject, Subject, Subscription, interval } from 'rxjs'
import { buffer } from 'rxjs/operators'

import { VertexId } from 'model/types'
import GraphEvent from 'model/GraphEvent'
import ReadGraph from 'model/ReadGraph'

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

class DistanceToRootDistributionCollector {
  private subscription: Subscription
  private distribution: number[] = []
  private distributionSubject: Subject<number[]> = new ReplaySubject(1)
  private distances: Map<VertexId, number> = new Map()

  public distribution$ = this.distributionSubject.asObservable()

  constructor(graph: ReadGraph) {
    this.subscription = graph.event$
      .pipe(buffer(interval(500)))
      .subscribe(this.onGraphEvents)
  }

  public destroy() {
    this.subscription.unsubscribe()
  }

  private onGraphEvents = (changes: GraphEvent[]) => {
    changes.forEach(this.processEvent)
    this.distributionSubject.next(this.distribution)
  }

  private processEvent = (event: GraphEvent) => {
    switch (event.type) {
      case 'AddedVertex':
        if (event.id === 0) {
          this.distances.set(event.id, 0)
          changeDist(this.distribution, 0, +1)
        }
        break
      case 'AddedEdge':
        const [v1, v2] = event.edge
        const d1 = this.distances.get(v1)
        const d2 = this.distances.get(v2)
        if (d1 === undefined && d2 === undefined) {
          // no change, nothing to do
        } else if (d1 !== undefined && d2 === undefined) {
          this.distances.set(v2, d1 + 1)
          changeDist(this.distribution, d1 + 1, +1)
        } else if (d2 !== undefined && d1 === undefined) {
          this.distances.set(v1, d2 + 1)
          changeDist(this.distribution, d2 + 1, +1)
        } else if (d1 !== undefined && d2 !== undefined) {
          if (d2 > d1) {
            // Decrease v2 distance
            this.distances.set(v2, d1 + 1)
            changeDist(this.distribution, d2, -1)
            changeDist(this.distribution, d1 + 1, +1)
          } else if (d1 > d2) {
            // Decrease v1 distance
            this.distances.set(v1, d2 + 1)
            changeDist(this.distribution, d1, -1)
            changeDist(this.distribution, d2 + 1, +1)
          }
        }
        break
      default:
    }
  }
}

export default DistanceToRootDistributionCollector
