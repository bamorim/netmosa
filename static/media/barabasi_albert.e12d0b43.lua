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
  selected = {}

  for i=1,m do
    -- Get the edge vertices and put it on a table
    vertices = {getRandomEdge()}

    -- Select a random vertice from the edge
    selected[i] = vertices[math.random(1,2)]
  end

  -- Add a new vertex
  newVertex = addVertex()

  -- Connect the new vertex to all selected vertices
  for i=1,m do
    connectVertices(newVertex, selected[i])
  end

  -- Give a chance to render
  render()
end