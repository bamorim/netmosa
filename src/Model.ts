import {v4} from 'uuid';

export type VertexId = number;
export type EdgeId = number;
export type Edge = [VertexId, VertexId];
type VertexAttributes = Map<string, string>;

export interface Vertex {
  readonly id: VertexId;
  readonly neighbors: VertexId[];
  readonly attributes: VertexAttributes;
}

export interface AddedVertex {
  type: 'AddedVertex',
  id: VertexId
}

export interface AddedEdge {
  type: 'AddedEdge',
  id: EdgeId
}

export interface SetAttribute {
  type: 'SetAttribute',
  id: VertexId,
  key: string,
  value: string
}

export type Change = AddedVertex | AddedEdge | SetAttribute

export interface ReadGraph {
  // TODO: Split into more specific interfaces (Interface Segregation Principle)
  readonly id: string;
  readonly vertices: Vertex[];
  readonly edges: Edge[];
  readonly changes: Change[];
  readonly degreeDistribution: number[];
}

export interface Graph extends ReadGraph {
  addVertex(): number;
  connectVertices(v1: VertexId, v2: VertexId): void;
  setAttribute(id: VertexId, key: string, value: string): void;
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

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

export class AdjacencyListGraph implements Graph {
  id: string;
  edges: Edge[] = [];
  vertices: Vertex[] = [];
  changes: Change[] = [];

  degreeDistribution: number[] = [];

  constructor() {
    this.id = v4();
  }

  vertexCount = () => this.vertices.length;
  edgeCount = () => this.edges.length;
  vertex = (id: VertexId) => this.vertices[id];
  edge = (id: EdgeId) => this.edges[id];
  addVertex = () => {
    const vertex = new AdjacencyListVertex(this.vertices.length);
    this.vertices.push(vertex);
    this.changes.push({type: 'AddedVertex', id: vertex.id});

    changeDist(this.degreeDistribution, 0, 1);

    return vertex.id;
  };

  connectVertices = (v1: VertexId, v2: VertexId) => {
    if (v1 >= this.vertices.length) return;
    if (v1 < 0) return;
    if (v2 >= this.vertices.length) return;
    if (v2 < 0) return;

    const edgeId = this.edges.length;
    this.edges.push([v1, v2]);
    this.changes.push({type: 'AddedEdge', id: edgeId});

    const neighborCount1 = this.vertices[v1].neighbors.length;
    const neighborCount2 = this.vertices[v2].neighbors.length;

    changeDist(this.degreeDistribution, neighborCount1, -1);
    changeDist(this.degreeDistribution, neighborCount1 + 1, +1);
    this.vertices[v1].neighbors.push(v2);

    if(v1 !== v2) {
      changeDist(this.degreeDistribution, neighborCount2, -1);
      changeDist(this.degreeDistribution, neighborCount2 + 1, +1);
      this.vertices[v2].neighbors.push(v1);
    }
  };

  setAttribute = (id: VertexId, key: string, value: string) => {
    this.vertices[id].attributes.set(key, value);
    this.changes.push({type: 'SetAttribute', id: id, key: key, value: value});
  }
}