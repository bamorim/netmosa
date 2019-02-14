import * as React from 'react'
import { ChartConfig, Transformation } from './types'
import ConfigControls from './ConfigControls'
import Chart from './Chart'
import distToData from './distToData'
import { Observable, Subscription } from 'rxjs'
import { sampleTime } from 'rxjs/operators'
import Statistics from './Statistics'
import FileSaver from 'components/FileSaver';

export interface Props {
  distribution: Observable<number[]>
  name: string
}

interface State extends ChartConfig {
  distribution: number[]
}

class DistributionChart extends React.Component<Props, State> {
  private subscription: Subscription

  public state: State = {
    distribution: [],
    transformation: 'pdf',
    xLog: false,
    yLog: false
  }

  public componentDidMount() {
    this.subscription = this.props.distribution
      .pipe(sampleTime(1000)) // Performance tweaking
      .subscribe((distribution: number[]) => this.setState({ distribution }))
  }

  public componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  public config(): ChartConfig {
    const { yLog, xLog, transformation } = this.state
    return { yLog, xLog, transformation }
  }

  public render() {
    const { distribution, ...config } = this.state
    const data = distToData(config, distribution)

    return (
      <div>
        <Chart
          data={data}
          xLog={config.xLog}
          yLog={config.yLog}
          name={this.props.name}
        />
        <ConfigControls
          {...config}
          setTransformation={(transformation: Transformation) =>
            this.setState({ transformation })
          }
          setXLog={(xLog: boolean) => this.setState({ xLog })}
          setYLog={(yLog: boolean) => this.setState({ yLog })}
        />
        <FileSaver
          contents={this.generateCSVBlob}
          defaultFilename="distribution.csv"
          label="Export to CSV"
        />
        <Statistics distribution={distribution} />
      </div>
    )
  }

  private generateCSVBlob = () => {
    const csv = this.state.distribution.map((v, i) => `${i},${v}`).join('\n')
    return new Blob([csv], {type: "text/csv;charset=utf-8"})
  }
}

export default DistributionChart
