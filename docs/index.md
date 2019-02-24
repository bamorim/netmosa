# Netmosa Docs

Netmosa is a network analysis tools focused on network models. It allows you to program (in Lua) a
model and see it unroll in real time.

## Running a Model

To run a model in Netmosa, you first need to code in the code editor (or load an example and tweak
the variables as described) and then you press **Run**.

Within the visualization screen (while the simulation is running) you can toggle the visualization
mode (between Graph and Statistics) by clicking on the Chart Icon (![Chart Icon]).

You can also export your file in [GraphML] format by clicking the Save Icon (![Save Icon])

You can adjust the speed of the simulation by dragging the slider on the top bar.

## Programming in Netmosa

We provide some examples you can check but ultimately you can write your own from scratch.

In order to be able to write your own models in Netmosa, you need to know th basics of Lua and get
used to our standard library.

### Our Graph Structure

In our graph, as usual, we have vertices and edges, but it also have vertex attributes.

Vertices are referenced by their Vertex ID (which is the index in the adjacency vector, so the first
Vertex has Vertex ID 1, because Lua is 1-indexed).

Edges are just a list with two elements, which are the two Vertex IDs of the two connected vertices.
Edges may also be referenced by an Edge ID

One special thing about vertices is that they can hold attributes, which are keyed by a string and
contains a string value. One special attribute is color, that is used to define the fill color of
the vertex when rendering it.

### Learning Lua

There are plenty of lua resources out there, I'll list a few here:

- Official free online book: [Programming in Lua](http://www.lua.org/pil/contents.html)
- [Official Reference Manual](http://www.lua.org/manual/5.3/)

#### Caveats

We use a special implementation of Lua made in Javascript: [Fengari](https://fengari.io/), they
claim it is 99% compatible with the PUC-Rio implementation, but there is a chance that something
does not work properly. However, I haven't had any problems.

Also, you probably won't be using these standard libraries: *io*, *os*, and *debug*, so I'd focus on
learning the **math** and **string** libraries, specially the former.

### Standard Library

EdgeId and VertexId are just lua numbers, we are annotating them here to make it easy to understand
what a function returns or receives.

#### addVertex(): VertexId

Adds a new vertex and returns its ID

#### connectVertices(id1: VertexId, id2: VertexId): EdgeId | Nil

Connect two vertices by their ids.
If successfull, returns the edge id, otherwise returns nil.

#### setAttributes(id: VertexId, key: String, value: String): Boolean

Set attributes for a vertex, receiving the vertex index, the attribute name and value.
One useful attribute is "color", which is used in the rendering.
Returns wheter or not the attribute was set (it won't be set if the vertex doesn't exist).

#### getAttributes(id: VertexId, key: String): String | Nil

Gets the value of a previously set attribute.
Returns nil if not set.

#### getNeighbor(id: VertexId, neighborIndex: Number): VertexId | Nil

Get the Id of a neighbor vertex, receiving the vertex Id and the neighbor index.
If the vertex doesnt exist or the index is out of range, returns nil.

#### getNeighborCount(id: VertexId): Number | Nil

Get the number of neighbors a given vertex (by index) has.
Useful for iterating through neighbors or getting a neighbor at random.
If the vertex for the given id doesn't exist, returns nil

#### getVertexCount(): Number

Get the number of vertices the graph has.
Useful for iterating through all vertices or getting one at random.

#### getEdgeCount(): Number

Get the number of edges the graph has.
Useful for iterating through all edges or getting one at random.

#### getEdge(id: EdgeId): (VertexId, VertexId) | Nil

Get an edge by it's index.
It is useful if you want to get the edge ends.
It either returns two values (each VertexId associated with the edge) or it returns nil, if the edge
doesn't exist.

#### getRandomVertex(): VertexId | Nil

Get a random vertex.
Returns nil if there are no vertices.

#### getRandomEdge(): (VertexId, VertexId) | Nil

Get a random edge.
It either returns two values (each VertexId associated with the edge) or it returns nil, if there
are no edges.

#### getRandomNeighbor(id: VertexId): VertexId | Nil

Get a random neighbor given a vertex.
It may return nil if there aren't any neighbors.

[GraphML]: http://graphml.graphdrawing.org/
[Chart Icon]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAABGdBTUEAALGPC/xhBQAAAAJiS0dEAP+Hj8y/AAAAB3RJTUUH4wIYDjcu9SZvbQAAARtJREFUKM/N0b9OU3EUAODv9LamiQwlOMFiXDBpQmK7Ed6AjQcwsWqZHZh4AQxlxo2BxJgQdgZGgsTEGhYfoDJ00ZgYF9t7fwxtsTLUEc56vpy/3FnE7HQTDJSU/sfSI08fSrNgA2ku3vrw50lZeToREuhO2IPY9sJ7P6ZmbAikqjwGJORRfmPHaWpFn2wCF2E+duNZuoicTDzXcel19Egj2Bixmo62tUjpPPK0bl9fy9eSQlc2aaqm46Uzv2xEIfMOr3zMFb4g/mEn2hYcqPsp047jYrwa2eI02/RN3yerlmxVDoc3jGhSs6flxKYehRJNK+nQMHz++8Imjx35rq03PouyUExVg6irsuy3K9LNqd1iREPFEBN2D+MaqSJX0SZA8X8AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDItMjRUMTc6NTU6NTktMDM6MDDOPUDSAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTAyLTI0VDE3OjU1OjQ2LTAzOjAwhYKIGQAAAABJRU5ErkJggg==
[Save Icon]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAABGdBTUEAALGPC/xhBQAAAAJiS0dEAP+Hj8y/AAAAB3RJTUUH4wIYDjsF9S/ZIQAAAR1JREFUKM+Nkr9KA0EQxn97d5gqMU1ARAikFELg7LT0AXyEQCoRfRBbY0haK9FrUqRNaRmt4htEBLnCNELI7VjsHnfZC9xNsezufPPn+2agoqnd51nuvtjxBIXQA/rAExtKgdfAczkQkn09elXJ5DKGjisE3osZQ8RIINhTIbngIJPkhNUFwgcAmnNU6y223oUtfUiD71WDe465QwOXPPAVX7HmiDW/aekBc7oqZkidCR06jKkzVDFd5gwyMk3a1AT1IpoRLeCHGxUJ1GjTzICCNo35kVY8ArdelBhy2tBzBE/wX/UGvKmrepDDoAANU9DptiQu0KcH+IVh9tI/A1yyZbR3xj5blhYoMFN9Tt3dtDQ/ZZZl/COquhyl9g/YAU02SLEkGAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wMi0yNFQxNzo1OTowOC0wMzowMDqWpYwAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDItMjRUMTc6NTk6MDUtMDM6MDAqHHzwAAAAAElFTkSuQmCC