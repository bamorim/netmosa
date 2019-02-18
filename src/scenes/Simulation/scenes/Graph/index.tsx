import * as React from 'react'
import { useState } from 'react'
import { createStyles, withStyles } from '@material-ui/core'

import { ReadGraph, VertexId } from 'graph'

import GraphView from './components/GraphView'
import HighlightedVertexDetails from './components/HighlightedVertexDetails'

export interface Props {
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    flex: '1',
    display: 'flex'
  },
  details: {
    position: 'absolute',
    bottom: 0,
    right: 0
  }
})

const GraphScene = (props: Props) => {
  const [vertexId, setVertexId] = useState<VertexId | undefined>(undefined)

  return (
    <div className={props.classes.container}>
      {vertexId !== undefined ? (
        <HighlightedVertexDetails
          vertexId={vertexId}
          graph={props.graph}
          classes={{ container: props.classes.details }}
        />
      ) : null}
      <GraphView graph={props.graph} onHighlightChange={setVertexId} />
    </div>
  )
}

export default withStyles(styles)(GraphScene)
