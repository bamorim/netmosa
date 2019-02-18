import * as React from 'react'
import { createStyles, withStyles } from '@material-ui/core'

import { VertexId, ReadGraph } from 'graph'
import KeyValueTable from 'components/KeyValueTable'

export interface Props {
  vertexId: VertexId
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0
  }
})

const HighlightedVertexDetails = (props: Props) => {
  const vertex = props.graph.vertices[props.vertexId]
  const entries: string[][] = [
    ["index", props.vertexId.toString()],
    ["degree", vertex.neighbors.length.toString()]
  ]

  vertex.attributes.forEach((val, key) => {
    entries.push([key, val])
  })

  return (
    <div className={props.classes.container}>
      <KeyValueTable entries={entries} />
    </div>
  )
}

export default withStyles(styles)(HighlightedVertexDetails)
