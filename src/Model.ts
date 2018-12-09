import {Observable, Observer, ReplaySubject} from 'rxjs';
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
  readonly vertices: Vertex[];
  readonly edges: Edge[];
  readonly subject: ReplaySubject<Change>;
}

export interface Graph extends ReadGraph {
  addVertex(): number;
  connectVertices(v1: VertexId, v2: VertexId): void;
  setAttribute(id: VertexId, key: string, value: string): void;
}

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

export interface GraphObserver {
  onChange: (change: Change) => any
}

export class AdjacencyListGraph implements Graph {
  edges: Edge[] = [];
  vertices: Vertex[] = [];
  subject: ReplaySubject<Change> = new ReplaySubject();

  vertexCount = () => this.vertices.length;
  edgeCount = () => this.edges.length;
  vertex = (id: VertexId) => this.vertices[id];
  edge = (id: EdgeId) => this.edges[id];
  addVertex = () => {
    const vertex = new AdjacencyListVertex(this.vertices.length);
    this.vertices.push(vertex);
    this.subject.next({type: 'AddedVertex', id: vertex.id});

    return vertex.id;
  };

  connectVertices = (v1: VertexId, v2: VertexId) => {
    if (v1 >= this.vertices.length) return;
    if (v1 < 0) return;
    if (v2 >= this.vertices.length) return;
    if (v2 < 0) return;

    const edgeId = this.edges.length;
    this.edges.push([v1, v2]);
    this.subject.next({type: 'AddedEdge', id: edgeId});
  };

  setAttribute = (id: VertexId, key: string, value: string) => {
    this.vertices[id].attributes.set(key, value);
    this.subject.next({type: 'SetAttribute', id: id, key: key, value: value});
  }
}