import { Action, Edge, Model, Vertex, Colorings, GraphDecorator } from './Model';
import * as uuid from "uuid";

interface Graph {
  size: number;
  edges: Edge[];
  adjacencyList: Vertex[][];
}

export interface RenderableGraph {
  readonly edges: Edge[];
  readonly colorings: Colorings;
  readonly version: String;
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

export class Simulation<S> implements IterableIterator<RenderableGraph> {
  private graph: Graph;
  private colorings: Colorings = [];
  private state: S;
  private model: Model<S>;
  private key: String;
  private iterations: number = 0;
  private renderableBuffer: RenderableGraph[] = [];

  constructor(initialState: S, model: Model<S>) {
    this.graph = { edges: [], adjacencyList: [[]], size: 1 };
    this.state = initialState;
    this.model = model;
    this.key = uuid.v4();
  }

  next(): IteratorResult<RenderableGraph> {
    if(this.renderableBuffer.length == 0) this.runSimulation();

    let value = this.renderableBuffer.shift()!
    console.log(value)
    return {
      done: false,
      value: value
    }
  }

  [Symbol.iterator](): IterableIterator<RenderableGraph> {
    return this;
  }

  private runSimulation() {
    let coloringChanges: Colorings[] = []
    let graphReader = toGraphReader(this.graph)
    let graphDecorator: GraphDecorator = {
      setColors: (colorings) => coloringChanges.push(colorings)
    }
    const resp: Action = this.model(graphReader, graphDecorator ,this.state);

    coloringChanges.forEach((colorings) => {
      this.colorings = colorings;
      this.pushRenderableState()
    })

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

    this.pushRenderableState()
  }

  private pushRenderableState() {
    this.iterations += 1

    this.renderableBuffer.push({
      edges: this.graph.edges.slice(),
      version: this.key + this.iterations.toString(),
      colorings: this.colorings.slice()
    })
  }
}