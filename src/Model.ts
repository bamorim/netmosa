export type VertexId = number;
export type EdgeId = number;
export type Edge = [VertexId, VertexId];
type VertexAttributes = Map<string, string>;

export interface Vertex {
  readonly id: VertexId;
  readonly neighbors: VertexId[];
  readonly attributes: VertexAttributes;
}

export interface ReadGraph {
  vertices: Vertex[];
  edges: Edge[];
}

export interface Graph extends ReadGraph {
  addVertex(): number;
  connectVertices(v1: VertexId, v2: VertexId): void;
}

export type Model = (g: Graph) => IterableIterator<Graph>;

class AdjacencyListVertex implements Vertex {
  id: VertexId;
  attributes: VertexAttributes = new Map();
  neighbors: VertexId[] = [];

  constructor(id: VertexId) {
    this.id = id;
  }
}

export class AdjacencyListGraph implements Graph {
  edges: Edge[] = [];
  vertices: Vertex[] = [];

  vertexCount = () => this.vertices.length;
  edgeCount = () => this.edges.length;
  vertex = (id: VertexId) => this.vertices[id];
  edge = (id: EdgeId) => this.edges[id];
  addVertex = () => {
    const vertex = new AdjacencyListVertex(this.vertices.length);
    this.vertices.push(vertex);
    return vertex.id;
  };
  connectVertices = (v1: VertexId, v2: VertexId) => {
    if (v1 >= this.vertices.length) return;
    if (v1 < 0) return;
    if (v2 >= this.vertices.length) return;
    if (v2 < 0) return;
    this.vertices[v1].neighbors.push(v2);
    if (v1 !== v2) this.vertices[v2].neighbors.push(v1);
    this.edges.push([v1, v2]);
  };
}