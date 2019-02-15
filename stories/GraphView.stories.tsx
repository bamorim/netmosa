import * as React from 'react'
import { storiesOf } from '@storybook/react'
import GraphView from '../src/components/GraphView'
import { AdjacencyListGraph } from '../src/graph'

storiesOf('GraphView', module).add('with a simple graph', () => {
  let graph = new AdjacencyListGraph()

  let attributes = [
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

  return <GraphView graph={graph} show={true} />
})
