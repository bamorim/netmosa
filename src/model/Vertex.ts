import { VertexId, VertexAttributes } from 'model/types'
import ReadVertex from 'model/ReadVertex'

export default class Vertex implements ReadVertex {
  public id: VertexId
  public attributes: VertexAttributes = new Map()
  public neighbors: VertexId[] = []

  constructor(id: VertexId) {
    this.id = id
  }
}
