import * as React from 'react'
import { createStyles, withStyles } from '@material-ui/core'
import { useState } from 'react'

import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import Layout from 'components/Layout'
import { TimedSimulation } from 'simulation'

import Statistics from './scenes/Statistics'
import Graph from './scenes/Graph'
import TopbarActions from './components/TopbarActions'
import FloatingActions from './components/FloatingActions'

const styles = createStyles({
  hidden: {
    display: 'none'
  },
  container: {
    position: 'relative',
    flex: '1',
    display: 'flex'
  }
})

interface Props {
  runningSimulation: TimedSimulation
  classes: Record<keyof typeof styles, string>
}

const SimulationScene = ({ runningSimulation, classes }: Props) => {
  const [showStatistics, setShowStatistics] = useState(false)
  const paused = useObservable(runningSimulation.paused$, true)
  const speed = useObservable(runningSimulation.speed$, 0)
  const { setSpeed, play, pause } = runningSimulation
  const { stop } = appState

  // Hide components instead of unmounting them to avoid re-rendering the graph
  const graphViewClasses = showStatistics ? { container: classes.hidden } : {}
  const statisticsClasses = showStatistics ? {} : { container: classes.hidden }

  const topbarActionsProps = {
    setSpeed,
    play,
    pause,
    stop,
    speed,
    paused
  }

  const floatingActionsProps = {
    toggleStatistics: () => setShowStatistics(!showStatistics),
    graph: runningSimulation.graph
  }

  return (
    <Layout actions={<TopbarActions {...topbarActionsProps} />}>
      <div className={classes.container}>
        <Graph graph={runningSimulation.graph} classes={graphViewClasses} />
        <Statistics
          graph={runningSimulation.graph}
          classes={statisticsClasses}
        />
        <FloatingActions {...floatingActionsProps} />
      </div>
    </Layout>
  )
}

export default withStyles(styles)(SimulationScene)
