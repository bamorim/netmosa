import { Observable } from 'rxjs'

export type VertexId = number
export type EdgeId = number
export type Edge = [VertexId, VertexId]
export type VertexAttributes = Map<string, string>

export interface ReadVertex {
  readonly id: VertexId
  readonly neighbors: ReadonlyArray<VertexId>
  readonly attributes: VertexAttributes
}

export interface Vertex extends ReadVertex {
  readonly neighbors: VertexId[]
}

export interface AddedVertex {
  type: 'AddedVertex'
  id: VertexId
}

export interface AddedEdge {
  type: 'AddedEdge'
  id: EdgeId
}

export interface SetAttribute {
  type: 'SetAttribute'
  id: VertexId
  key: string
  value: string
}

export type Change = AddedVertex | AddedEdge | SetAttribute

export interface ReadGraph {
  readonly vertices: ReadonlyArray<ReadVertex>
  readonly edges: ReadonlyArray<Edge>
  readonly change$: Observable<Change>
  getAttribute(id: VertexId, key: string): string | undefined
  getNeighbor(id: VertexId, idx: number): VertexId | undefined
  getNeighborCount(id: VertexId): number | undefined
  getEdge(id: EdgeId): Edge | undefined
  getRandomVertex(): VertexId | undefined
  getRandomEdge(): Edge | undefined
  getRandomNeighbor(id: VertexId): VertexId | undefined
}

export interface Graph extends ReadGraph {
  addVertex(): number
  connectVertices(v1: VertexId, v2: VertexId): EdgeId | undefined
  setAttribute(id: VertexId, key: string, value: string): boolean
}
