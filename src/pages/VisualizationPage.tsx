import * as React from 'react'
import Layout from 'Layout'
import { createStyles, withStyles, IconButton } from '@material-ui/core'
import { useLayoutEffect } from 'react'
import Slider from '@material-ui/lab/Slider'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'

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
      <IconButton onClick={() => play()} color="inherit">
        <PlayIcon />
      </IconButton>
    )
  } else {
    pauseOrPlayButton = (
      <IconButton onClick={() => pause()} color="inherit">
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
              onChange={(e, v) => setSpeed(v)}
            />
          </div>
          {pauseOrPlayButton}
          <IconButton onClick={stop} color="inherit">
            <StopIcon />
          </IconButton>
        </div>
      }
    >
      <GraphView graph={graph} />
    </Layout>
  )
}

export default withStyles(styles)(VisualizationPage)
