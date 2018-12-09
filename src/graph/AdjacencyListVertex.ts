import { VertexId, VertexAttributes, Vertex } from "./types"

export default class AdjacencyListVertex implements Vertex {
  public id: VertexId
  public attributes: VertexAttributes = new Map()
  public neighbors: VertexId[] = []

  constructor(id: VertexId) {
    this.id = id
  }
}
