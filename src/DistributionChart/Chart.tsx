import * as React from 'react'
import { LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts'
import { Datum } from './types'

interface Props {
  xLog: boolean
  yLog: boolean
  data: Datum[]
  name: string
}

class Chart extends React.PureComponent<Props> {
  public render() {
    const xLogFormatter = (x: number) => Math.round(Math.exp(x))
    const yLogFormatter = (y: number) =>
      `${Math.round(Math.exp(y) * 10000) / 100}%`
    const yLinFormatter = (y: number) => `${Math.round(y * 10000) / 100}%`

    const xFormatter = this.props.xLog ? xLogFormatter : (x: number) => x
    const yFormatter = this.props.yLog ? yLogFormatter : yLinFormatter

    return (
      <LineChart
        width={730}
        height={250}
        data={this.props.data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          domain={['dataMin', 'dataMax']}
          tickFormatter={xFormatter}
        />
        <YAxis domain={['dataMin', 'dataMax']} tickFormatter={yFormatter} />
        <Legend verticalAlign="top" height={36} />
        <Tooltip/>
        <Line
          type="monotone"
          dataKey="y"
          stroke="#8884d8"
          isAnimationActive={false}
          name={this.props.name}
        />
      </LineChart>
    )
  }
}

export default Chart
