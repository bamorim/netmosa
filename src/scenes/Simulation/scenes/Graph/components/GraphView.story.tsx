import * as React from 'react'
import { useState } from 'react'
import { storiesOf } from '@storybook/react'

import { AdjacencyListGraph, VertexId } from 'graph'

import GraphView from './GraphView'

const graph = new AdjacencyListGraph()

const attributes = [
  new Map([["color", "red"]]),
  new Map([["color", "green"], ["foo", "bar"]]),
  new Map([["color", "blue"], ["foo", "foo"], ["bar", "bar"]]),
  new Map([["color", "#FF0"], ["foo", "foo"], ["bar", "bar"]]),
  new Map([["color", "#00FFFF"]])
]

for (let i = 0; i < 10; i++) {
  graph.addVertex()
  attributes[i % 5].forEach((val, key) => {
    graph.setAttribute(i, key, val)
  })
}

for (let i = 1; i < 10; i++) {
  graph.connectVertices(0, i)
}

const GraphViewWithHighlight = () => {
  const [current, setCurrent] = useState<VertexId | undefined>(undefined)
  return <>
    <div>Current Highlighted: {current === undefined ? "None" : current}</div>
    <GraphView graph={graph} onHighlightChange={setCurrent} />
  </>
}

storiesOf('GraphView', module)
  .add('with a simple graph', () => <GraphView graph={graph} />)
  .add('with a hover function', () => <GraphViewWithHighlight/>)
