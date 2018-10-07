
import {IGraph, Model} from './Model';


export const lineModel : Model = function*(graph: IGraph) {
  let vertexId = graph.addVertex()
  while(true) {
    let lastId = vertexId
    vertexId = graph.addVertex()
    graph.connectVertices(vertexId, lastId)
    yield graph
  }
}

export const startModel : Model = function*(graph: IGraph) {
  let firstId = graph.addVertex()
  while(true) {
    graph.connectVertices(firstId, graph.addVertex())
    yield graph
  }
}

export const randomWalkModel : Model = function*(graph: IGraph, k: number) {
  let pos = graph.addVertex()
  graph.connectVertices(pos, pos)
  graph.vertices[pos]!.attributes.set('color', 'red')

  while(true) {
    for (let i = 0; i < k; i++) {
      graph.vertices[pos]!.attributes.delete('color')
      const neighbors = graph.vertices[pos]!.neighbors;
      const selection = Math.floor(Math.random() * neighbors.length);
      pos = neighbors[selection];
      graph.vertices[pos]!.attributes.set('color', 'red')
      yield graph
    }
    graph.connectVertices(pos, graph.addVertex())
    yield graph
  }
}