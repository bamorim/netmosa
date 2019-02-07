import { ReadGraph, Change } from '../graph'
import { ReplaySubject, Subject } from 'rxjs'

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

class DegreeDistribution {
  private graph: ReadGraph
  private dist: number[]
  public subject: Subject<number[]>

  constructor(graph: ReadGraph) {
    this.graph = graph
    this.subject = new ReplaySubject(1)
    this.graph.subject.subscribe(this.onGraphEvent)
    this.dist = []
  }

  private onGraphEvent = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        changeDist(this.dist, 0, 1)
        break
      case 'AddedEdge':
        const [v1, v2] = this.graph.edges[change.id]
        const neighborCount1 = this.graph.vertices[v1].neighbors.length
        const neighborCount2 = this.graph.vertices[v2].neighbors.length

        changeDist(this.dist, neighborCount1 - 1, -1)
        changeDist(this.dist, neighborCount1, +1)

        if (v1 !== v2) {
          changeDist(this.dist, neighborCount2 - 1, -1)
          changeDist(this.dist, neighborCount2, +1)
        }
        break
      default:
    }

    this.subject.next(this.dist)
  }
}

export default DegreeDistribution
