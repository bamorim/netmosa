export type Vertex = number;
export type Edge = [Vertex, Vertex];
type NeighborFunc = (v: Vertex) => Vertex[];
type GetEdgeFunc = (i: number) => Edge;

export interface GraphReader {
  readonly vertexCount: number;
  readonly edgeCount: number;
  readonly neighborsOf: NeighborFunc;
  readonly getEdge: GetEdgeFunc;
}

export interface AddVertex {
  action: 'addVertex';
  connectTo: Vertex;
}

export interface AddEdge {
  action: 'addEdge';
  edge: Edge;
}

export type Action = AddVertex|AddEdge;

export type Model<S> = (g: GraphReader, s: S) => Action;