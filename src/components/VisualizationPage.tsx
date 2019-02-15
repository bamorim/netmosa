import * as React from 'react'
import Layout from 'components/Layout'
import { createStyles, withStyles, IconButton, Fab } from '@material-ui/core'
import { useState } from 'react'
import * as xmlbuilder from 'xmlbuilder'
import Slider from '@material-ui/lab/Slider'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import ChartIcon from '@material-ui/icons/ShowChart'
import SaveIcon from '@material-ui/icons/SaveAlt'

import GraphView from 'components/GraphView'
import MetricsView from 'components/MetricsView'
import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import { TimedSimulation } from 'simulation'
import FileSaver from './FileSaver'
import { ReadGraph } from 'graph'

const styles = createStyles({
  hidden: {
    display: 'none'
  },
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
    right: 10
  },
  fab1: {
    top: 10
  },
  fab2: {
    top: 60
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

const generateGraphML = (graph: ReadGraph) => {
  // TODO: Add attributes in GraphML export
  const nodeXml = graph.vertices.map((v, i) => ({ '@id': `n${i}` }))
  const edgeXml = graph.edges.map(([s, t], i) => ({
    '@source': `n${s}`,
    '@target': `n${t}`
  }))

  const graphXml = {
    graphml: {
      '@xmlns': 'http://graphml.graphdrawing.org/xmlns',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation': [
        'http://graphml.graphdrawing.org/xmlns',
        'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd'
      ].join(' '),
      graph: {
        '@id': 'G',
        '@edgedefault': 'undirected',
        node: nodeXml,
        edge: edgeXml
      }
    }
  }
  const xml = xmlbuilder
    .create(graphXml, { encoding: 'utf-8' })
    .end({ pretty: true })
  return new Blob([xml], { type: 'application/graphml+xml;charset=utf-8' })
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

  // Hide components instead of unmounting them to avoid re-rendering the graph
  const graphViewClasses = showChart ? {container: classes.hidden} : {}
  const metricsViewClasses = showChart ? {} : {container: classes.hidden}

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
        <GraphView graph={runningSimulation.graph} classes={graphViewClasses} />
        <MetricsView graph={runningSimulation.graph} classes={metricsViewClasses} />
        <Fab
          className={classes.fab + ' ' + classes.fab1}
          size="small"
          onClick={() => setShowChart(!showChart)}
        >
          <ChartIcon />
        </Fab>
        <FileSaver
          button={({ onClick }) => (
            <Fab
              className={classes.fab + ' ' + classes.fab2}
              size="small"
              onClick={onClick}
            >
              <SaveIcon />
            </Fab>
          )}
          defaultFilename="graph.graphml"
          contents={() => generateGraphML(runningSimulation.graph)}
        />
      </div>
    </Layout>
  )
}

export default withStyles(styles)(VisualizationPage)
