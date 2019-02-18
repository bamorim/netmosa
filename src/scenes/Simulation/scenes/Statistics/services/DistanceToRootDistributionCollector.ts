import { ReplaySubject, Subject, Subscription } from 'rxjs'

import { ReadGraph, Change } from 'graph'

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

class DistanceToRootDistributionCollector {
  private graph: ReadGraph
  private distribution: number[]
  private distance: number[]
  private subscription: Subscription
  public subject: Subject<number[]>

  constructor(graph: ReadGraph) {
    this.graph = graph
    this.subject = new ReplaySubject(1)
    this.subscription = this.graph.subject.subscribe(this.onGraphEvent)
    this.distribution = []
    this.distance = []
  }

  public destroy() {
    this.subscription.unsubscribe()
  }

  private onGraphEvent = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        if (change.id === 0) {
          this.distance[change.id] = 0
          changeDist(this.distribution, 0, +1)
        } else {
          this.distance[change.id] = -1
        }
        break
      case 'AddedEdge':
        const [v1, v2] = this.graph.edges[change.id]
        const d1 = this.distance[v1]
        const d2 = this.distance[v2]
        if (d1 === -1 && d2 > 0) {
          this.distance[v1] = d2 + 1
          changeDist(this.distribution, d2 + 1, +1)
        } else if (d1 >= 0 && d2 === -1) {
          this.distance[v2] = d1 + 1
          changeDist(this.distribution, d1 + 1, +1)
        } else if (d1 >= 0 && d2 > d1) {
          this.distance[v2] = d1 + 1
          changeDist(this.distribution, d2, -1)
          changeDist(this.distribution, d1 + 1, +1)
        } else if (d2 >= 0 && d1 > d2) {
          this.distance[v1] = d2 + 1
          changeDist(this.distribution, d1, -1)
          changeDist(this.distribution, d2 + 1, +1)
        }
        break
      default:
    }

    this.subject.next(this.distribution)
  }
}

export default DistanceToRootDistributionCollector
