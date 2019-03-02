import { VertexId, VertexAttributes } from 'model/types'

export default interface ReadVertex {
  readonly id: VertexId
  readonly neighbors: ReadonlyArray<VertexId>
  readonly attributes: VertexAttributes
}
