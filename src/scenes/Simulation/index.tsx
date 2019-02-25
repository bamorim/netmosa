import * as React from 'react'
import { createStyles, withStyles } from '@material-ui/core'
import { useState, useEffect } from 'react'

import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import Layout from 'components/Layout'
import { TimedSimulation } from 'simulation'

import Statistics from './scenes/Statistics'
import Graph from './scenes/Graph'
import TopbarActions from './components/TopbarActions'
import FloatingActions from './components/FloatingActions'
import { Subject, ReplaySubject } from 'rxjs'

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
  simulation: TimedSimulation
  classes: Record<keyof typeof styles, string>
}

const SimulationScene = ({ simulation: simulation, classes }: Props) => {
  const [showStatistics, setShowStatistics] = useState(false)

  const [autozoomEnabled$] = useState<Subject<boolean>>(new Subject())
  useEffect(() => autozoomEnabled$.next(true), [autozoomEnabled$])
  const autozoomEnabled = useObservable(autozoomEnabled$, true)

  const paused = useObservable(simulation.paused$, true)
  const speed = useObservable(simulation.speed$, 0)
  const { setSpeed, play, pause } = simulation
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
    toggleAutozoom: () => autozoomEnabled$.next(!autozoomEnabled),
    graph: simulation.graph
  }

  return (
    <Layout actions={<TopbarActions {...topbarActionsProps} />}>
      <div className={classes.container}>
        <Graph
          simulation={simulation}
          classes={graphViewClasses}
          autozoomEnabled$={autozoomEnabled$}
        />
        <Statistics graph={simulation.graph} classes={statisticsClasses} />
        <FloatingActions {...floatingActionsProps} />
      </div>
    </Layout>
  )
}

export default withStyles(styles)(SimulationScene)
