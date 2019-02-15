import * as React from 'react'
import { ReadGraph } from '../graph'
import { withStyles, createStyles, Grid } from '@material-ui/core'

import DegreeDistribution from '../metrics/DegreeDistribution'
import DistanceToRootDistribution from '../metrics/DistanceToRootDistribution'

import DistributionContainer from './distribution/DistributionContainer'
import GraphGeneralStatisicsDisplay from './GraphGeneralStatisticsDisplay'

interface Props {
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    padding: '10px'
  },
  centered: {
    textAlign: 'center'
  }
})

class MetricsView extends React.Component<Props> {
  private degreeDist: DegreeDistribution
  private rootDistanceDist: DistanceToRootDistribution

  constructor(props: Props) {
    super(props)
    this.degreeDist = new DegreeDistribution(props.graph)
    this.rootDistanceDist = new DistanceToRootDistribution(props.graph)
  }

  public render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <Grid container={true} spacing={24}>
          <Grid item={true} xs={12} className={classes.centered}>
            <GraphGeneralStatisicsDisplay graph={this.props.graph} />
          </Grid>
          <Grid item={true} xs={6}>
            <DistributionContainer
              distribution={this.degreeDist.subject}
              name="Degree"
            />
          </Grid>
          <Grid item={true} xs={6}>
            <DistributionContainer
              distribution={this.rootDistanceDist.subject}
              name="Distance to Root"
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(MetricsView)
