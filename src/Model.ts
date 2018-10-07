export type Vertex = number;
export type Edge = [Vertex, Vertex];
export type NeighborFunc = (v: Vertex) => Vertex[];
export type GetEdgeFunc = (i: number) => Edge;
export type Colorings = [Vertex, string][]
export type SetColorsFunc = (mapping: Colorings) => void;

export interface GraphReader {
  readonly vertexCount: number;
  readonly edgeCount: number;
  readonly neighborsOf: NeighborFunc;
  readonly getEdge: GetEdgeFunc;
}

export interface GraphDecorator {
  readonly setColors: SetColorsFunc
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

export type Model<S> = (g: GraphReader, d: GraphDecorator, s: S) => Action;