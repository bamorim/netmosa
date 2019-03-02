import { ReplaySubject } from 'rxjs'

import { VertexId, Edge, EdgeId } from 'model/types'
import GraphEvent from 'model/GraphEvent'
import ReadGraph from 'model/ReadGraph'
import Vertex from 'model/Vertex'

export default class Graph implements ReadGraph {
  private eventSubject = new ReplaySubject<GraphEvent>()
  private edgeCountSubject = new ReplaySubject<number>(1)
  private vertexCountSubject = new ReplaySubject<number>(1)

  public edges: Edge[] = []
  public vertices: Vertex[] = []
  public event$ = this.eventSubject.asObservable()
  public edgeCount$ = this.edgeCountSubject.asObservable()
  public vertexCount$ = this.vertexCountSubject.asObservable()

  constructor() {
    this.edgeCountSubject.next(0)
    this.vertexCountSubject.next(0)
  }

  public addVertex = () => {
    const vertex = new Vertex(this.vertices.length)
    this.vertices.push(vertex)
    this.vertexCountSubject.next(this.vertices.length)
    this.eventSubject.next({ type: 'AddedVertex', id: vertex.id })

    return vertex.id
  }

  public connectVertices = (v1: VertexId, v2: VertexId) => {
    if (v1 >= this.vertices.length) {
      return
    }
    if (v1 < 0) {
      return
    }
    if (v2 >= this.vertices.length) {
      return
    }
    if (v2 < 0) {
      return
    }

    const edgeId = this.edges.length
    const edge: Edge = [v1, v2]
    this.edges.push(edge)
    this.edgeCountSubject.next(this.edges.length)
    this.vertices[v1].neighbors.push(v2)
    if (v1 !== v2) {
      this.vertices[v2].neighbors.push(v1)
    }
    this.eventSubject.next({ type: 'AddedEdge', id: edgeId, edge })
    return edgeId
  }

  public setAttribute = (id: VertexId, key: string, value: string) => {
    if (this.vertices.length > id) {
      this.vertices[id].attributes.set(key, value)
      this.eventSubject.next({ type: 'SetAttribute', id, key, value })
      return true
    } else {
      return false
    }
  }

  public getAttribute(id: VertexId, key: string): string | undefined {
    if (this.vertices.length > id) {
      return this.vertices[id].attributes.get(key)
    } else {
      return undefined
    }
  }

  public getNeighbor(id: VertexId, idx: number): VertexId | undefined {
    if (this.vertices.length > id && this.vertices[id].neighbors.length > idx) {
      return this.vertices[id].neighbors[idx]
    } else {
      return undefined
    }
  }

  public getNeighborCount(id: VertexId): number | undefined {
    if (this.vertices.length > id) {
      return this.vertices[id].neighbors.length
    } else {
      return undefined
    }
  }

  public getEdge(id: EdgeId): Edge | undefined {
    if (this.edges.length > id) {
      return this.edges[id]
    } else {
      return undefined
    }
  }

  public getRandomVertex(): VertexId | undefined {
    if (this.vertices.length > 0) {
      return Math.floor(Math.random() * this.vertices.length)
    } else {
      return undefined
    }
  }

  public getRandomEdge(): Edge | undefined {
    if (this.edges.length > 0) {
      const edgeId = Math.floor(Math.random() * this.edges.length)
      return this.edges[edgeId]
    } else {
      return undefined
    }
  }

  public getRandomNeighbor(id: VertexId): VertexId | undefined {
    if (this.vertices.length > id && this.vertices[id].neighbors.length > 0) {
      const neighborIndex = Math.floor(
        Math.random() * this.vertices[id].neighbors.length
      )
      const neighborId = this.vertices[id].neighbors[neighborIndex]
      return neighborId
    } else {
      return undefined
    }
  }
}
