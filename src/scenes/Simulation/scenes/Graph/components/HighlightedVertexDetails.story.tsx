import * as React from 'react'
import { storiesOf } from '@storybook/react'

import { AdjacencyListGraph } from 'graph'

import HighlightedVertexDetails from './HighlightedVertexDetails'

const graph = new AdjacencyListGraph()

const attributes = new Map([['color', 'blue'], ['foo', 'foo'], ['bar', 'bar']])

graph.addVertex()

const vertexId = graph.addVertex()

attributes.forEach((val, key) => {
  graph.setAttribute(vertexId, key, val)
})
storiesOf('HighlightedVertexDetails', module).add('with a simple graph', () => (
  <HighlightedVertexDetails graph={graph} vertexId={vertexId} />
))
