import { Observable } from 'rxjs'

import { Edge, VertexId, EdgeId } from 'model/types'
import GraphEvent from 'model/GraphEvent'
import ReadVertex from 'model/ReadVertex'

export default interface ReadGraph {
  readonly vertices: ReadonlyArray<ReadVertex>
  readonly edges: ReadonlyArray<Edge>
  readonly event$: Observable<GraphEvent>
  readonly edgeCount$: Observable<number>
  readonly vertexCount$: Observable<number>
  getAttribute(id: VertexId, key: string): string | undefined
  getNeighbor(id: VertexId, idx: number): VertexId | undefined
  getNeighborCount(id: VertexId): number | undefined
  getEdge(id: EdgeId): Edge | undefined
  getRandomVertex(): VertexId | undefined
  getRandomEdge(): Edge | undefined
  getRandomNeighbor(id: VertexId): VertexId | undefined
}
