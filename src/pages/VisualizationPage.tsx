
import * as React from 'react';
import Layout from 'Layout';
import { useEffect } from 'react';
import { Button } from '@material-ui/core';

import { luaModel } from 'LuaModel';
import { AdjacencyListGraph } from 'graph';
import GraphView from 'GraphView';

interface Props {
  code: string;
  stop: () => void;
}

const VisualizationPage = ({ code, stop }: Props) => {
  const graph = new AdjacencyListGraph();
  const simulation = luaModel(code)(graph);
  simulation.next();

  useEffect(() => {
    const interval = setInterval(() => {
      simulation.next()
    }, 100)
    return () => {
      clearInterval(interval);
    }
  })

  return (
    <Layout actions={
      <Button onClick={stop} color="inherit">Stop</Button>
    }>
      <GraphView graph={graph} />
    </Layout>
  )
}

export default VisualizationPage;