export type VertexId = number;
export type EdgeId = number;
export type Edge = [VertexId, VertexId];
type VertexAttributes = Map<string, string>

export interface IVertex {
  readonly id: VertexId
  readonly neighbors: Array<VertexId>
  readonly attributes: VertexAttributes
}

export interface IReadGraph {
  vertices: Array<IVertex>
  edges: Array<Edge>
}

export interface IGraph extends IReadGraph {
  addVertex(): number
  connectVertices(v1: VertexId, v2: VertexId): void
}

export type Model = (g: IGraph, ...rest: any[]) => IterableIterator<IGraph>

class Vertex implements IVertex {
  public id: VertexId
  public attributes: VertexAttributes = new Map()
  public neighbors: Array<VertexId> = []

  constructor(id: VertexId) {
    this.id = id;
  }
}

export class Graph implements IGraph {
  public edges: Edge[] = [];
  public vertices: Vertex[] = [];

  vertexCount = () => this.vertices.length
  edgeCount = () => this.edges.length
  vertex = (id: VertexId) => this.vertices[id]
  edge = (id: EdgeId) => this.edges[id]
  addVertex = () => {
    let vertex = new Vertex(this.vertices.length)
    this.vertices.push(vertex)
    return vertex.id
  }
  connectVertices = (v1: VertexId, v2: VertexId) => {
    if (v1 >= this.vertices.length) return;
    if (v1 < 0) return;
    if (v2 >= this.vertices.length) return;
    if (v2 < 0) return;
    this.vertices[v1].neighbors.push(v2);
    if(v1 != v2) this.vertices[v2].neighbors.push(v1);
    this.edges.push([v1, v2]);
  }
}