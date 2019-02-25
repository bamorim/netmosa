import { ReplaySubject, Subject, Subscription } from 'rxjs'

import { ReadGraph, Change, VertexId } from 'graph'

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

class DistanceToRootDistributionCollector {
  private graph: ReadGraph
  private distribution: number[]
  private distances: Map<VertexId, number>
  private subscription: Subscription
  private distributionSubject: Subject<number[]> = new ReplaySubject(1)

  public distribution$ = this.distributionSubject.asObservable()

  constructor(graph: ReadGraph) {
    this.graph = graph
    this.subscription = this.graph.change$.subscribe(this.onGraphEvent)
    this.distribution = []
    this.distances = new Map()
  }

  public destroy() {
    this.subscription.unsubscribe()
  }

  private onGraphEvent = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        if (change.id === 0) {
          this.distances.set(change.id, 0)
          changeDist(this.distribution, 0, +1)
        }
        break
      case 'AddedEdge':
        const [v1, v2] = this.graph.edges[change.id]
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

    this.distributionSubject.next(this.distribution)
  }
}

export default DistanceToRootDistributionCollector
