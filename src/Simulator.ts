import { Action, Edge, Model, Vertex } from './Model';

interface Graph {
  size: number;
  edges: Edge[];
  adjacencyList: Vertex[][];
}

const addVertex = (graph: Graph, connectTo: Vertex) => {
  if (connectTo >= graph.size) return;
  if (connectTo < 0) return;
  graph.adjacencyList[connectTo].push(graph.size);
  graph.adjacencyList.push([connectTo]);
  graph.edges.push([connectTo, graph.size]);
  graph.size++;
};

// TODO: Should we check for edge existence?
const connectVertices = (graph: Graph, a: Vertex, b: Vertex) => {
  if (a >= graph.size) return;
  if (a < 0) return;
  if (b >= graph.size) return;
  if (b < 0) return;
  graph.adjacencyList[a].push(b);
  graph.adjacencyList[b].push(a);
  graph.edges.push([a, b]);
};

const toGraphReader = (graph: Graph) => {
  return {
    vertexCount: graph.size,
    edgeCount: graph.edges.length,
    neighborsOf: (i: Vertex) => graph.adjacencyList[i],
    getEdge: (i: number) => graph.edges[i]
  };
};

export class Simulation<S> implements IterableIterator<Edge> {
  private graph: Graph;
  private state: S;
  private model: Model<S>;
  constructor(initialState: S, model: Model<S>) {
    this.graph = { edges: [], adjacencyList: [[]], size: 1 };
    this.state = initialState;
    this.model = model;
  }

  next(): IteratorResult<Edge> {
    const resp: Action = this.model(toGraphReader(this.graph), this.state);
    switch (resp.action) {
      case 'addVertex':
        addVertex(this.graph, resp.connectTo);
        break;
      case 'addEdge':
        connectVertices(this.graph, resp.edge[0], resp.edge[1]);
        break;
      default:
        break;
    }

    return { done: false, value: this.graph.edges[this.graph.edges.length - 1] };
  }

  [Symbol.iterator](): IterableIterator<Edge> {
    return this;
  }
}