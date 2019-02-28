import * as React from 'react'
import { createStyles, withStyles, Tabs, Tab } from '@material-ui/core'
import { useState, useEffect } from 'react'

import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import Layout from 'components/Layout'
import { TimedSimulation } from 'simulation'

import Graph from './scenes/Graph'
import TopbarActions from './components/TopbarActions'
import { Subject, interval, generate } from 'rxjs'
import DegreeDistributionCollector from './services/DegreeDistributionCollector'
import DistanceToRootDistributionCollector from './services/DistanceToRootDistributionCollector'
import useStatefulObject from 'hooks/useStatefulObject'
import DistributionView from './components/DistributionView'
import { generateGraphML } from './services/generateGraphML'
import { throttle } from 'rxjs/operators'

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

type TabValue = 'graph' | 'degree_dist' | 'distance_dist'

const SimulationScene = ({ simulation, classes }: Props) => {
  const { setSpeed, play, pause } = simulation
  const { stop, setAutozoomEnabled } = appState

  const [currentTab, setCurrentTab] = useState<TabValue>('graph')
  const autozoomEnabled = useObservable(appState.autozoomEnabled$, true)
  const paused = useObservable(simulation.paused$, true)
  const speed = useObservable(simulation.speed$, 0)
  const edgeCount = useObservable(
    simulation.graph.edgeCount$.pipe(throttle(val => interval(100))),
    0
  )
  const vertexCount = useObservable(
    simulation.graph.vertexCount$.pipe(throttle(val => interval(100))),
    0
  )

  const degreeDist = useStatefulObject(
    () => new DegreeDistributionCollector(simulation.graph),
    collector => collector.destroy(),
    [simulation.graph]
  )

  const rootDistanceDist = useStatefulObject(
    () => new DistanceToRootDistributionCollector(simulation.graph),
    collector => collector.destroy(),
    [simulation.graph]
  )

  // Hide components instead of unmounting them to avoid re-rendering the graph
  const graphViewClasses =
    currentTab === 'graph' ? {} : { container: classes.hidden }
  const degreeDistClasses =
    currentTab === 'degree_dist' ? {} : { container: classes.hidden }
  const distanceDistClasses =
    currentTab === 'distance_dist' ? {} : { container: classes.hidden }

  const topbarActionsProps = {
    autozoomEnabled,
    edgeCount,
    generateGraphML: generateGraphML.bind(null, simulation.graph),
    pause,
    paused,
    play,
    setAutozoomEnabled,
    setSpeed,
    speed,
    stop,
    vertexCount
  }

  return (
    <Layout actions={<TopbarActions {...topbarActionsProps} />}>
      <Tabs
        value={currentTab}
        onChange={(change, value) => setCurrentTab(value)}
        indicatorColor="primary"
        textColor="primary"
        centered={true}
      >
        <Tab value="graph" label="Graph" />
        <Tab value="degree_dist" label="Degree" />
        <Tab value="distance_dist" label="Distance to Root" />
      </Tabs>
      <div className={classes.container}>
        <Graph simulation={simulation} classes={graphViewClasses} />
        {degreeDist ? (
          <DistributionView
            distribution={degreeDist.distribution$}
            classes={degreeDistClasses}
            name="Degree"
          />
        ) : null}
        {rootDistanceDist ? (
          <DistributionView
            distribution={rootDistanceDist.distribution$}
            classes={distanceDistClasses}
            name="Distance to Root"
          />
        ) : null}
      </div>
    </Layout>
  )
}

export default withStyles(styles)(SimulationScene)
