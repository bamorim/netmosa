import * as React from 'react'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip
} from 'recharts'
import { Datum } from './types'
import { maxBy, minBy, reduce, range } from 'ramda'

interface SNProps {
  number: number
}

const trimmedExponential = (number: number) => {
  const [mantissa, exponent] = number.toExponential().split('e')
  return `${mantissa.substring(0, 4)}e${exponent}`
}

const ScientificNumber = ({ number }: SNProps) => {
  const [mantissa, exponent] = trimmedExponential(number).split('e')
  const normalExponent = exponent.substring(0,1) == "+" ? exponent.substring(1) : exponent
  return <span>{mantissa} 10<sup>{normalExponent}</sup></span>
}

interface Props {
  xLog: boolean
  yLog: boolean
  data: Datum[]
  name: string
}

const config = (log: boolean, values: number[]) => {
  const normalize = log ? (v: number) => Math.pow(10, v) : (v: number) => v

  const maxVal = reduce(maxBy((x: number) => x), -Infinity, values)
  const minVal = reduce(minBy((x: number) => x), +Infinity, values)
  const baseTicks = range(Math.ceil(minVal), Math.floor(maxVal) + 1)
  const ticks = log ? baseTicks : baseTicks.filter(x => x % 5 == 0)

  return { ticks, normalize }
}

class Chart extends React.PureComponent<Props> {
  public render() {
    const xConfig = config(this.props.xLog, this.props.data.map(({ x }) => x))
    const yConfig = config(this.props.yLog, this.props.data.map(({ y }) => y))

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
          ticks={xConfig.ticks}
          tickFormatter={(number) => trimmedExponential(xConfig.normalize(number))}
        />
        <YAxis
          domain={['dataMin', 'dataMax']}
          ticks={yConfig.ticks}
          tickFormatter={(number) => trimmedExponential(yConfig.normalize(number))}
        />
        <Legend verticalAlign="top" height={36} />
        <Tooltip
          formatter={(value: number) => <ScientificNumber number={yConfig.normalize(value)}/>}
          labelFormatter={(value: number) => <span>
            {this.props.name}: <ScientificNumber number={xConfig.normalize(value)}/>
            </span>}
        />
        <Line
          dataKey="y"
          stroke="#8884d8"
          isAnimationActive={false}
          name="P"
        />
      </LineChart>
    )
  }
}

export default Chart
