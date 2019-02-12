import * as React from 'react'
import Layout from 'components/Layout'
import { createStyles, withStyles, IconButton, Fab } from '@material-ui/core'
import { useState } from 'react'
import Slider from '@material-ui/lab/Slider'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import ChartIcon from '@material-ui/icons/ShowChart'

import GraphView from 'components/GraphView'
import MetricsView from 'components/MetricsView'
import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import { TimedSimulation } from 'simulation'

const styles = createStyles({
  sliderWrapper: {
    width: 150,
    padding: '0 10px',
    display: 'inline-flex'
  },
  track: {
    background: '#ffffff'
  },
  thumb: {
    background: '#999999'
  },
  fab: {
    position: 'absolute',
    right: 10,
    top: 10
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

const VisualizationPage = ({ runningSimulation, classes }: Props) => {
  const [showChart, setShowChart] = useState(false)
  const paused = useObservable(runningSimulation.paused$, true)
  const speed = useObservable(runningSimulation.speed$, 0)

  let pauseOrPlayButton

  if (paused) {
    pauseOrPlayButton = (
      <IconButton onClick={() => runningSimulation.play()} color="inherit">
        <PlayIcon />
      </IconButton>
    )
  } else {
    pauseOrPlayButton = (
      <IconButton onClick={() => runningSimulation.pause()} color="inherit">
        <PauseIcon />
      </IconButton>
    )
  }

  return (
    <Layout
      actions={
        <div>
          <div className={classes.sliderWrapper}>
            <Slider
              classes={{ track: classes.track, thumb: classes.thumb }}
              value={speed}
              onChange={(e, v) => runningSimulation.setSpeed(v)}
            />
          </div>
          {pauseOrPlayButton}
          <IconButton onClick={appState.stop} color="inherit">
            <StopIcon />
          </IconButton>
        </div>
      }
    >
      <div className={classes.container}>
        <GraphView graph={runningSimulation.graph} show={!showChart} />
        <MetricsView graph={runningSimulation.graph} show={showChart} />
        <Fab
          className={classes.fab}
          size="small"
          onClick={() => setShowChart(!showChart)}
        >
          <ChartIcon />
        </Fab>
      </div>
    </Layout>
  )
}

export default withStyles(styles)(VisualizationPage)
