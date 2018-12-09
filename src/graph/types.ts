import { ReplaySubject } from "rxjs";

export type VertexId = number;
export type EdgeId = number;
export type Edge = [VertexId, VertexId];
export type VertexAttributes = Map<string, string>;

export interface ReadVertex {
  readonly id: VertexId;
  readonly neighbors: ReadonlyArray<VertexId>;
  readonly attributes: VertexAttributes;
}

export interface Vertex extends ReadVertex {
  readonly neighbors: VertexId[];
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
  readonly vertices: ReadonlyArray<ReadVertex>;
  readonly edges: ReadonlyArray<Edge>;
  readonly subject: ReplaySubject<Change>;
}

export interface Graph extends ReadGraph {
  addVertex(): number;
  connectVertices(v1: VertexId, v2: VertexId): void;
  setAttribute(id: VertexId, key: string, value: string): void;
}