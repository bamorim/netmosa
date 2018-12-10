import * as React from 'react'
import Layout from 'Layout'
import { Button, createStyles, withStyles } from '@material-ui/core'
import { useLayoutEffect } from 'react'
import Slider from '@material-ui/lab/Slider'
import '@material-ui/lab'

import GraphView from 'GraphView'
import useSimulation from 'useSimulation'
import useTimer from 'useTimer'

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
  }
})

interface Props {
  code: string
  stop: () => void
  classes: Record<keyof typeof styles, string>
}

const VisualizationPage = ({ code, stop, classes }: Props) => {
  const { tick, graph } = useSimulation(code)
  const { play, pause, paused, setSpeed, speed } = useTimer(0, tick)
  useLayoutEffect(() => {
    play()
    return () => {
      pause()
    }
  }, [])

  let pauseOrPlayButton

  if (paused) {
    pauseOrPlayButton = (
      <Button onClick={() => play()} color="inherit">
        Resume
      </Button>
    )
  } else {
    pauseOrPlayButton = (
      <Button onClick={() => pause()} color="inherit">
        Pause
      </Button>
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
              onChange={(e, v) => setSpeed(v)}
            />
          </div>
          {pauseOrPlayButton}
          <Button onClick={stop} color="inherit">
            Stop
          </Button>
        </div>
      }
    >
      <GraphView graph={graph} />
    </Layout>
  )
}

export default withStyles(styles)(VisualizationPage)
