import * as React from 'react'
import { Transformation } from './distribution.types'
import DistributionConfigForm from './DistributionConfigForm'
import DistributionChart from './DistributionChart'
import { Observable, Subscription } from 'rxjs'
import { sampleTime } from 'rxjs/operators'
import DistributionStatistics from './DistributionStatistics'
import FileSaver from 'components/FileSaver';

export interface Props {
  distribution: Observable<number[]>
  name: string
}

interface State {
  distribution: number[]
  transformation: Transformation
  xLog: boolean
  yLog: boolean
}

class DistributionContainer extends React.Component<Props, State> {
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
      <div>
        <h3>{this.props.name}</h3>
        <DistributionChart
          {...this.state}
          name={this.props.name}
        />
        <DistributionConfigForm
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
        <DistributionStatistics distribution={distribution} />
      </div>
    )
  }

  private generateCSVBlob = () => {
    const csv = this.state.distribution.map((v, i) => `${i},${v}`).join('\n')
    return new Blob([csv], {type: "text/csv;charset=utf-8"})
  }
}

export default DistributionContainer
