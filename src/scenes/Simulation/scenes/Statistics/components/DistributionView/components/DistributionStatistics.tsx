import * as React from 'react'
import { min, max } from 'ramda'

import ScientificNotation from 'components/ScientificNotation';
import KeyValueTable from 'components/KeyValueTable';

interface Props {
  distribution: number[]
}

const DistributionStatistics = ({ distribution }: Props) => {
  const nonZeroValues = distribution.map((y, x) => ({y, x})).filter(({y}) => y > 0)
  const count = nonZeroValues.reduce((curr, {y}) => curr + y, 0)
  const minVal = nonZeroValues.reduce((curr, {x}) => min(curr, x), +Infinity)
  const maxVal = nonZeroValues.reduce((curr, {x}) => max(curr, x), -Infinity)
  const mean = nonZeroValues.map(({x, y}) => x*y).reduce((a, b) => a+b, 0) / count

  const entries = [
    ["min", <ScientificNotation key="min" value={minVal} />],
    ["max", <ScientificNotation key="max" value={maxVal} />],
    ["mean", <ScientificNotation key="mean" value={mean} />]
  ]

  return <KeyValueTable entries={entries} />
}

export default DistributionStatistics
