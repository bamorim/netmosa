p = 0.1
n = 50
vertices = {}

for i=1,n do
    vertices[i] = addVertex()
end

render()

for i=1,n do
    for j=i+1,n do
        if math.random() < p then
            connectVertices(vertices[i], vertices[j])
            render()
        end
    end
end

render()