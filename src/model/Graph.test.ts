import Graph from './Graph'

test('it starts empty', () => {
  const graph = new Graph()
  expect(graph.vertices.length).toBe(0)
  expect(graph.edges.length).toBe(0)
})

test('it add new vertices', () => {
  const graph = new Graph()
  graph.addVertex()
  graph.addVertex()
  expect(graph.vertices.length).toBe(2)
})

test('it can connect vertices', () => {
  const graph = new Graph()
  graph.connectVertices(graph.addVertex(), graph.addVertex())
  expect(graph.vertices.length).toBe(2)
  expect(graph.edges.length).toBe(1)
  expect(graph.edges[0].sort()).toEqual([0, 1])
})
