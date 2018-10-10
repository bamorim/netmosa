-- Start with two connected vertices
connectVertices(addVertex(), addVertex())

while true do
  -- Get the edge vertices and put it on a table
  vertices = {getEdge(math.random(getEdgeCount()))}

  -- Add a new vertex connected to a random vertice from the edge
  connectVertices(addVertex(), vertices[math.random(1,2)])

  -- Give a chance to render
  coroutine.yield()
end