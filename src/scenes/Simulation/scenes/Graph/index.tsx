import * as React from 'react'
import { createStyles, withStyles } from '@material-ui/core'

import { ReadGraph } from 'graph'

import GraphView from './components/GraphView'

export interface Props {
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    flex: '1',
    display: 'flex'
  }
})

const GraphScene = (props: Props) => (
  <div className={props.classes.container}>
    <GraphView graph={props.graph} />
  </div>
)

export default withStyles(styles)(GraphScene)
