import * as React from 'react'
import { ChartConfig, Transformation, Datum } from './types';
import ConfigControls from './ConfigControls';
import Chart from './Chart';
import distToData from './distToData';

export interface Props {
  distribution: number[]
}

class DistributionChart extends React.Component<Props, ChartConfig> {
  state: ChartConfig = {
    transformation: 'ccdf',
    xLog: false,
    yLog: false
  }

  setTransformation = (transformation: Transformation) => {
    this.setState({transformation})
  }

  setXLog = (xLog: boolean) => {
    this.setState({xLog})
  }

  setYLog = (yLog: boolean) => {
    this.setState({yLog})
  }

  render() {
    const {distribution} = this.props

    const xLogFormatter = (x: number) => Math.round(Math.exp(x))
    const yLogFormatter = (y: number) => `${Math.round(Math.exp(y)*10000)/100}%`
    const yLinFormatter = (y: number) => `${Math.round(y*10000)/100}%`

    const xFormatter = this.state.xLog ? xLogFormatter : (x: number) => x
    const yFormatter = this.state.yLog ? yLogFormatter : yLinFormatter

    const {setYLog, setXLog, setTransformation} = this
    const {yLog, xLog, transformation} = this.state
    const configProps = {setYLog, setXLog, setTransformation, xLog, yLog, transformation}

    return (
      <div>
        <Chart data={distToData(this.state, distribution)} xLog={xLog} yLog={yLog}/>
        <ConfigControls {...configProps}/>
      </div>
    )
  }
}

export default DistributionChart