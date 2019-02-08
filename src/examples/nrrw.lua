-- Number of steps
k = 2

-- Add the first vertex with self loop
local pos = addVertex()
connectVertices(pos, pos)
setAttributes(pos, "color", "red")

-- Give a chance to render
render()

-- Main Loop
while true do
  for i=1,k do
    -- Take a random walk step
    setAttributes(pos, "color", "white")
    pos = getNeighbor(pos, math.random(1,getNeighborCount(pos)))
    setAttributes(pos, "color", "red")

    -- Give a chance to render
    render()
  end
  connectVertices(pos, addVertex())

  -- Give a chance to render
  render()
end