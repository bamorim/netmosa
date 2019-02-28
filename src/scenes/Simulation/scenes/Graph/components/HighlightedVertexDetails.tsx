import * as React from 'react'
import { createStyles, withStyles, Paper } from '@material-ui/core'

import { VertexId, ReadGraph } from 'graph'
import KeyValueTable from 'components/KeyValueTable'

export interface Props {
  vertexId: VertexId
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    margin: '10px'
  }
})

const HighlightedVertexDetails = (props: Props) => {
  const vertex = props.graph.vertices[props.vertexId]
  const entries: string[][] = [
    ['index', props.vertexId.toString()],
    ['degree', vertex.neighbors.length.toString()]
  ]

  vertex.attributes.forEach((val, key) => {
    entries.push([key, val])
  })

  return (
    <Paper className={props.classes.container}>
      <KeyValueTable entries={entries} />
    </Paper>
  )
}

export default withStyles(styles)(HighlightedVertexDetails)
