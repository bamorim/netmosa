-- Add the root node and color it red
local root = addVertex()
setAttributes(root, "color", "red")
-- Give a chance to render
render()

while true do
  -- get a node at random
  local u = getRandomVertex()
  -- create a new leaf
  local v = addVertex()
  -- connect the leaf to the node
  connectVertices(u, v)
  -- color it yellow for now and white later
  setAttributes(v, "color", "yellow")
  render()
  setAttributes(v, "color", "white")
end