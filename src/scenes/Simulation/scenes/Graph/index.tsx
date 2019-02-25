import * as React from 'react'
import { useState } from 'react'
import { createStyles, withStyles } from '@material-ui/core'
import { Observable } from 'rxjs';

import { VertexId } from 'graph'

import GraphView from './components/GraphView'
import HighlightedVertexDetails from './components/HighlightedVertexDetails'
import { TimedSimulation } from 'simulation'

export interface Props {
  simulation: TimedSimulation
  classes: Record<keyof typeof styles, string>
  autozoomEnabled$?: Observable<boolean>
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
          graph={props.simulation.graph}
          classes={{ container: props.classes.details }}
        />
      ) : null}
      <GraphView
        graph={props.simulation.graph}
        bufferBy={props.simulation.tick$}
        onHighlightChange={setVertexId}
        autozoomEnabled$={props.autozoomEnabled$}
      />
    </div>
  )
}

export default withStyles(styles)(GraphScene)
