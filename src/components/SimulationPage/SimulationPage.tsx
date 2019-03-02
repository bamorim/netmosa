import * as React from 'react'
import { createStyles, withStyles, Tabs, Tab } from '@material-ui/core'
import { useState } from 'react'
import { sampleTime } from 'rxjs/operators'

import SimulationState from 'model/SimulationState'
import useObservable from 'hooks/useObservable'
import Layout from 'components/Layout'

import GraphPage from './GraphPage'
import DistributionPage from './DistributionPage/DistributionPage'
import TopbarActions from './TopbarActions'

import generateGraphML from 'model/generateGraphML'

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
  stop: () => void
  simulationState: SimulationState
  classes: Record<keyof typeof styles, string>
}

type TabValue = 'graph' | 'degree_dist' | 'distance_dist'

const SimulationScene = ({ simulationState, classes, stop }: Props) => {
  const {
    simulation,
    autozoomEnabled$,
    degreeDistributionCollector,
    distanceToRootDistributionCollector,
    setAutozoomEnabled
  } = simulationState
  const { setSpeed, play, pause } = simulation

  const [currentTab, setCurrentTab] = useState<TabValue>('graph')

  const autozoomEnabled = useObservable(autozoomEnabled$, true)
  const paused = useObservable(simulation.paused$, true)
  const speed = useObservable(simulation.speed$, 0)
  const edgeCount = useObservable(
    simulation.graph.edgeCount$.pipe(sampleTime(250)),
    0
  )
  const vertexCount = useObservable(
    simulation.graph.vertexCount$.pipe(sampleTime(250)),
    0
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
        onChange={(evt, value) => setCurrentTab(value)}
        indicatorColor="primary"
        textColor="primary"
        centered={true}
      >
        <Tab value="graph" label="Graph" />
        <Tab value="degree_dist" label="Degree" />
        <Tab value="distance_dist" label="Distance to Root" />
      </Tabs>
      <div className={classes.container}>
        <GraphPage
          simulation={simulation}
          classes={graphViewClasses}
          autozoomEnabled$={autozoomEnabled$}
        />
        <DistributionPage
          distribution={degreeDistributionCollector.distribution$}
          classes={degreeDistClasses}
          name="Degree"
        />
        <DistributionPage
          distribution={distanceToRootDistributionCollector.distribution$}
          classes={distanceDistClasses}
          name="Distance to Root"
        />
      </div>
    </Layout>
  )
}

export default withStyles(styles)(SimulationScene)
