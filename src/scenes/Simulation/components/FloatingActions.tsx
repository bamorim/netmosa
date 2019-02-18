import * as React from 'react'
import { createStyles, withStyles, Fab } from '@material-ui/core'
import { ReadGraph } from 'graph'
import FileSaver from 'components/FileSaver'
import ChartIcon from '@material-ui/icons/ShowChart'
import SaveIcon from '@material-ui/icons/SaveAlt'
import { generateGraphML } from '../services/generateGraphML';

const styles = createStyles({
  floating: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  fab: {
    display: 'block',
    margin: '10px 10px 20px'
  }
})

interface Props {
  toggleStatistics: () => void
  classes: Record<keyof typeof styles, string>
  graph: ReadGraph
}

const FloatingActions = (props: Props) => (
  <div className={props.classes.floating}>
    <Fab
      className={props.classes.fab}
      size="small"
      onClick={() => props.toggleStatistics()}
    >
      <ChartIcon />
    </Fab>
    <FileSaver
      button={({ onClick }) => (
        <Fab className={props.classes.fab} size="small" onClick={onClick}>
          <SaveIcon />
        </Fab>
      )}
      defaultFilename="graph.graphml"
      contents={() => generateGraphML(props.graph)}
    />
  </div>
)

export default withStyles(styles)(FloatingActions)
