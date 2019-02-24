import * as React from 'react'
import { storiesOf } from '@storybook/react'

import { AdjacencyListGraph } from 'graph'

import FloatingActions from './FloatingActions'

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

const noop = () => {} // tslint:disable-line

storiesOf('scenes.Simulation.components.FloatingActions', module)
  .add('with a simple graph', () => <FloatingActions graph={graph} toggleStatistics={noop} />)
