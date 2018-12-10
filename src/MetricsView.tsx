import * as React from 'react'
import { useReducer, useEffect } from 'react'
import { ReadGraph, Change } from 'graph'
import { withStyles, createStyles } from '@material-ui/core'

interface Props {
  show: boolean
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  hidden: {
    display: 'none'
  }
})

const MetricsView = ({ show, graph, classes }: Props) => {
  const [rootDistanceDist, dispatchToRootDistance] = useReducer(
    distanceToRootDistributionReducer(graph),
    { distance: [], distribution: [] }
  )
  const [degreeDist, dispatchToDegree] = useReducer(
    degreeDistributionReducer(graph),
    []
  )
  useEffect(() => {
    const subscriptions = [
      graph.subject.subscribe(dispatchToDegree),
      graph.subject.subscribe(dispatchToRootDistance)
    ]
    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
  }, [])

  const className = show
    ? classes.container
    : `${classes.container} ${classes.hidden}`

  return (
    <div className={className}>
      {JSON.stringify(degreeDist)}
      {JSON.stringify(rootDistanceDist)}
    </div>
  )
}

export default withStyles(styles)(MetricsView)

const changeDist = (dist: number[], idx: number, amt: number) => {
  dist[idx] = dist[idx] || 0
  dist[idx] += amt
}

const degreeDistributionReducer = (graph: ReadGraph) => (
  state: number[],
  change: Change
) => {
  switch (change.type) {
    case 'AddedVertex':
      changeDist(state, 0, 1)
      break
    case 'AddedEdge':
      const [v1, v2] = graph.edges[change.id]
      const neighborCount1 = graph.vertices[v1].neighbors.length
      const neighborCount2 = graph.vertices[v2].neighbors.length

      changeDist(state, neighborCount1, -1)
      changeDist(state, neighborCount1 + 1, +1)

      if (v1 !== v2) {
        changeDist(state, neighborCount2, -1)
        changeDist(state, neighborCount2 + 1, +1)
      }
      break
    default:
  }
  return state
}

interface DistanceToRootState {
  distribution: number[]
  distance: number[]
}
const distanceToRootDistributionReducer = (graph: ReadGraph) => (
  state: DistanceToRootState,
  change: Change
) => {
  switch (change.type) {
    case 'AddedVertex':
      if (change.id == 0) {
        state.distance[change.id] = 0
        changeDist(state.distribution, 0, +1)
      } else {
        state.distance[change.id] = -1
      }
      break
    case 'AddedEdge':
      const [v1, v2] = graph.edges[change.id]
      const d1 = state.distance[v1]
      const d2 = state.distance[v2]
      if (d1 === -1 && d2 > 0) {
        state.distance[v1] = d2 + 1
        changeDist(state.distribution, d2 + 1, +1)
      } else if (d1 >= 0 && d2 === -1) {
        state.distance[v2] = d1 + 1
        changeDist(state.distribution, d1 + 1, +1)
      } else if (d1 >= 0 && d2 > d1) {
        state.distance[v2] = d1 + 1
        changeDist(state.distribution, d2, -1)
        changeDist(state.distribution, d1 + 1, +1)
      } else if (d2 >= 0 && d1 > d2) {
        state.distance[v1] = d2 + 1
        changeDist(state.distribution, d1, -1)
        changeDist(state.distribution, d2 + 1, +1)
      }
      break
    default:
  }
  return state
}
