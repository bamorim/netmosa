import * as React from 'react'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { maxBy, minBy, reduce, range } from 'ramda'
import ScientificNotation, {
  trimmedExponential
} from 'components/ScientificNotation'
import min from 'ramda/es/min';

export type Transformation = 'pdf' | 'cdf' | 'ccdf'

interface Props {
  distribution: number[]
  transformation: Transformation
  xLog: boolean
  yLog: boolean
  name: string
}

interface Datum {
  x: number
  y: number
}

const DistributionChart = (props: Props) => {
  let data: Datum[] = transform(props.distribution, props.transformation).map(
    (v, i) => ({
      x: i,
      y: v || 0
    })
  )

  if (props.xLog) {
    data = applyLog('x', data)
  }

  if (props.yLog) {
    data = applyLog('y', data)
  }

  const xConfig = config(props.xLog, data.map(({ x }) => x))
  const yConfig = config(props.yLog, data.map(({ y }) => y))

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          domain={['dataMin', 'dataMax']}
          ticks={xConfig.ticks}
          tickFormatter={value => trimmedExponential(xConfig.normalize(value))}
        />
        <YAxis
          domain={['dataMin', 'dataMax']}
          ticks={yConfig.ticks}
          tickFormatter={value => trimmedExponential(yConfig.normalize(value))}
        />
        <Legend verticalAlign="top" height={36} />
        <Tooltip
          formatter={(value: number) => (
            <ScientificNotation value={yConfig.normalize(value)} />
          )}
          labelFormatter={(value: number) => (
            <span>
              {props.name}:{' '}
              <ScientificNotation value={xConfig.normalize(value)} />
            </span>
          )}
        />
        <Line dataKey="y" stroke="#8884d8" isAnimationActive={false} name="P" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default DistributionChart

const linearTicks = (minVal: number, maxVal: number) => {
  const desiredTickCount = 6
  const naturalCount = Math.floor(maxVal - minVal)
  const tickCount = min(desiredTickCount, naturalCount)
  const tickPeriod = Math.ceil((maxVal - minVal) / tickCount)
  return range(1, tickCount+1).map((i) => i * tickPeriod).filter((v) => v <= maxVal)
}

const logTicks = (minVal: number, maxVal: number) => range(Math.ceil(minVal), Math.floor(maxVal) + 1)

const config = (log: boolean, values: number[]) => {
  const normalize = log ? (v: number) => Math.pow(10, v) : (v: number) => v
  const maxVal = reduce(maxBy((x: number) => x), -Infinity, values)
  const minVal = reduce(minBy((x: number) => x), +Infinity, values)
  const ticks = log ? logTicks(minVal, maxVal) : linearTicks(minVal, maxVal)

  return { ticks, normalize }
}

const applyLog = (selector: keyof Datum, data: Datum[]): Datum[] =>
  data
    .filter(datum => datum[selector] > 0)
    .map(datum => ({ ...datum, [selector]: Math.log10(datum[selector]) }))

const transform = (distribution: number[], transformation: Transformation) => {
  switch (transformation) {
    case 'pdf':
      return pdf(distribution)
    case 'cdf':
      return cdf(distribution)
    default:
      return ccdf(distribution)
  }
}

const pdf = (distribution: number[]): number[] => {
  const total = distribution.reduce((a, b) => a + b, 0)
  return distribution.map(x => x / total)
}
const cdf = (distribution: number[]): number[] => {
  const result: number[] = []
  pdf(distribution).forEach(x =>
    result.push((result[result.length - 1] || 0) + x)
  )
  return result
}

const ccdf = (distribution: number[]): number[] =>
  cdf(distribution).map(x => 1 - x)
