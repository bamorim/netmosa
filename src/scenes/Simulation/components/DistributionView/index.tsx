import * as React from 'react'
import { Observable, Subscription } from 'rxjs'
import { sampleTime } from 'rxjs/operators'

import FileSaver from 'components/FileSaver'

import DistributionConfigForm from './components/DistributionConfigForm'
import DistributionChart, {
  Transformation
} from './components/DistributionChart'
import DistributionStatistics from './components/DistributionStatistics'
import { createStyles, withStyles, Grid, Button } from '@material-ui/core'

const styles = createStyles({
  container: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 50px'
  },
  chartContainer: {
    flex: '1',
    paddingBottom: '50px'
  }
})

export interface Props {
  distribution: Observable<number[]>
  name: string
  classes: Record<keyof typeof styles, string>
}

interface State {
  distribution: number[]
  transformation: Transformation
  xLog: boolean
  yLog: boolean
}

class DistributionView extends React.Component<Props, State> {
  private subscription: Subscription

  public state: State = {
    distribution: [],
    transformation: 'pdf',
    xLog: false,
    yLog: false
  }

  public componentDidMount() {
    this.subscription = this.props.distribution
      .pipe(sampleTime(500)) // Performance tweaking
      .subscribe((distribution: number[]) => this.setState({ distribution }))
  }

  public componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  public render() {
    const { distribution, ...config } = this.state

    return (
      <div className={this.props.classes.container}>
        <div className={this.props.classes.chartContainer}>
          <DistributionChart {...this.state} name={this.props.name} />
        </div>
        <Grid container={true} spacing={24}>
          <Grid item={true} xs={6}>
            <DistributionConfigForm
              {...config}
              setTransformation={(transformation: Transformation) =>
                this.setState({ transformation })
              }
              setXLog={(xLog: boolean) => this.setState({ xLog })}
              setYLog={(yLog: boolean) => this.setState({ yLog })}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <FileSaver
              contents={this.generateCSVBlob}
              defaultFilename="distribution.csv"
              button={
                (props) => <Button variant="outlined" {...props}>Export Distribution to CSV</Button>
              }
            />
            <DistributionStatistics distribution={distribution} />
          </Grid>
        </Grid>
      </div>
    )
  }

  private generateCSVBlob = () => {
    const csv = this.state.distribution.map((v, i) => `${i},${v}`).join('\n')
    return new Blob([csv], { type: 'text/csv;charset=utf-8' })
  }
}

export default withStyles(styles)(DistributionView)
