import { ReplaySubject } from 'rxjs'
import { VertexId, Graph, Vertex, Edge, Change, EdgeId } from './types'
import AdjacencyListVertex from './AdjacencyListVertex'

export default class AdjacencyListGraph implements Graph {
  private changeSubject: ReplaySubject<Change> = new ReplaySubject()
  public edges: Edge[] = []
  public vertices: Vertex[] = []
  public change$ = this.changeSubject.asObservable()

  public vertexCount = () => this.vertices.length
  public edgeCount = () => this.edges.length
  public vertex = (id: VertexId) => this.vertices[id]
  public edge = (id: EdgeId) => this.edges[id]
  public addVertex = () => {
    const vertex = new AdjacencyListVertex(this.vertices.length)
    this.vertices.push(vertex)
    this.changeSubject.next({ type: 'AddedVertex', id: vertex.id })

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
    this.edges.push([v1, v2])
    this.vertices[v1].neighbors.push(v2)
    if (v1 !== v2) {
      this.vertices[v2].neighbors.push(v1)
    }
    this.changeSubject.next({ type: 'AddedEdge', id: edgeId })
  }

  public setAttribute = (id: VertexId, key: string, value: string) => {
    this.vertices[id].attributes.set(key, value)
    this.changeSubject.next({ type: 'SetAttribute', id, key, value })
  }
}
