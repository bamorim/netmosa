import * as React from 'react'
import { ReadGraph } from 'graph'
import { withStyles, createStyles, Grid } from '@material-ui/core'
import DistributionChart from 'components/DistributionChart'
import DegreeDistribution from 'metrics/DegreeDistribution'
import DistanceToRootDistribution from 'metrics/DistanceToRootDistribution'

interface Props {
  show: boolean
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  hidden: {
    display: 'none'
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
    const { classes, show } = this.props
    const className = show
      ? classes.container
      : `${classes.container} ${classes.hidden}`

    return (
      <div className={className}>
        <Grid container={true} spacing={24}>
          <Grid item={true} xs={6}>
            <DistributionChart
              distribution={this.degreeDist.subject}
              name="Degree"
            />
          </Grid>
          <Grid item={true} xs={6}>
            <DistributionChart
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
