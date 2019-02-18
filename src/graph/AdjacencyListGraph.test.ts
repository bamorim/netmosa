import AdjacencyListGraph from './AdjacencyListGraph'

test('it starts empty', () => {
  const graph = new AdjacencyListGraph()
  expect(graph.vertices.length).toBe(0)
  expect(graph.edges.length).toBe(0)
})

test('it add new vertices', () => {
  const graph = new AdjacencyListGraph()
  graph.addVertex()
  graph.addVertex()
  expect(graph.vertices.length).toBe(2)
})

test('it can connect vertices', () => {
  const graph = new AdjacencyListGraph()
  graph.connectVertices(graph.addVertex(), graph.addVertex())
  expect(graph.vertices.length).toBe(2)
  expect(graph.edges.length).toBe(1)
  expect(graph.edges[0].sort()).toEqual([0, 1])
})
