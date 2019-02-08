-- Welcome to rggvis, a visualization tool for network models
-- Here you can write your Lua code to program your model
-- After you code it, you can run and see it happening
-- This code here is just an example to show a little bit of how to program your model
-- If you want, you can load some example models on the menu uptop.

-- For example, you can add a vertex (and save it's index)
root = addVertex()

-- Then, you need to explicitly say that the tool can render
render()

-- You can also set some attributes on each node (string key and value)
setAttributes(root, "key", "value")

-- If you need for something, you can get the attribute back
getAttributes(root, "key") -- Will return "value"

-- There is a special attribute "color" which the render uses to paint the vertex
setAttributes(root, "color", "red")
render()
setAttributes(root, "color", "#FFAA44")
render()

-- Let's add more vertexes and connect them
for i=1,10 do
  newVertex = addVertex()
  connectVertices(root, newVertex)
  render()
end

-- Let's add a new vertex connected to the two sides of the last edge
-- first we add the new node
newVertex = addVertex()
render()
-- then get the two nodes of the edge
vertexA, vertexB =  getEdge(getEdgeCount())
-- and then connect to the two nodes on the edge
connectVertices(vertexA, newVertex)
render()
connectVertices(vertexB, newVertex)
render()

-- Let's connect the last and second nodes
connectVertices(getVertexCount(),2)
render()