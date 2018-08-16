import {generate, interval, Observable, zip} from 'rxjs';
import {map} from 'rxjs/operators';

// Definitions

type Vertex = number;
type Edge = [Vertex, Vertex];
type NeighborFunc = (v: Vertex) => Vertex[];
type GetEdgeFunc = (i: number) => Edge;

interface Graph {
  readonly vertexCount: number;
  readonly edgeCount: number;
  readonly neighborsOf: NeighborFunc;
  readonly getEdge: GetEdgeFunc;
}

interface AddVertex {
  action: 'addVertex';
  connectTo: Vertex;
}

interface AddEdge {
  action: 'addEdge';
  edge: Edge;
}

type Action = AddVertex|AddEdge;

// Estudar como fazer S ser "event-sourced"

type Model<S> = (g: Graph, s: S) => Action;

// Simple Model

const starModel: Model<number> = (g: Graph, _: number): Action => {
  const action: Action = {action: 'addVertex', connectTo: 0};
  return action;
};

// Persistent Graph

interface PersistentGraph {
  size: number;
  edges: Edge[];
  adjacencyList: Vertex[][];
}

const addVertex = (graph: PersistentGraph, connectTo: Vertex) => {
  if (connectTo >= graph.size) return;
  if (connectTo < 0) return;
  graph.adjacencyList[connectTo].push(graph.size);
  graph.adjacencyList.push([connectTo]);
  graph.edges.push([connectTo, graph.size]);
  graph.size++;
};

// TODO: Should we check for edge existence?
const connectVertices = (graph: PersistentGraph, a: Vertex, b: Vertex) => {
  if (a >= graph.size) return;
  if (a < 0) return;
  if (b >= graph.size) return;
  if (b < 0) return;
  graph.adjacencyList[a].push(b);
  graph.adjacencyList[b].push(a);
  graph.edges.push([a, b]);
};

const toGraph = (graph: PersistentGraph) => {
  return {
    vertexCount: graph.size,
    edgeCount: graph.edges.length,
    neighborsOf: (i: Vertex) => graph.adjacencyList[i],
    getEdge: (i: number) => graph.edges[i]
  };
};

const graph = {
  edges: [],
  adjacencyList: [[]],
  size: 1
};

addVertex(graph, 0);

const simulation: Observable<Edge> =
    generate<Edge>([0, 1], (v: Edge) => true, (v: Edge) => {
      const resp: Action = starModel(toGraph(graph), 1);
      switch (resp.action) {
        case 'addVertex':
          addVertex(graph, resp.connectTo);
          break;
        case 'addEdge':
          connectVertices(graph, resp.edge[0], resp.edge[1]);
          break;
        default:
          break;
      }
      return graph.edges[graph.edges.length - 1];
    });

simulation.subscribe((x: Edge) => console.log(x));