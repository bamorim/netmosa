import * as React from 'react'
import Layout from 'Layout'
import { Button } from '@material-ui/core'
import { useLayoutEffect } from 'react'

import GraphView from 'GraphView'
import useSimulation from 'useSimulation'
import useTimer from 'useTimer'

interface Props {
  code: string
  stop: () => void
}

const VisualizationPage = ({ code, stop }: Props) => {
  const { tick, graph } = useSimulation(code)
  const { play, pause, paused } = useTimer(0, tick)
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

export default VisualizationPage
