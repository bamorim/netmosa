m0 = 2
m = 2
initials = {}

for i=1,m0 do
  initials[i] = addVertex()
  for j=1,(i-1) do
    connectVertices(j, i)
  end
end

while true do
  -- Add a new vertex
  newVertex = addVertex()

  for i=1,m do
    -- Get the edge vertices and put it on a table
    vertices = {getEdge(math.random(getEdgeCount()))}

    -- Connect the new vertex to a random vertice from the edge
    connectVertices(newVertex, vertices[math.random(1,2)])
  end

  -- Give a chance to render
  coroutine.yield()
end