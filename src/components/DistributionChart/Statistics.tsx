import * as React from 'react'
import { min, max } from 'ramda'
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import ScientificNotation from 'simulation/ScientificNotation';

interface Props {
  distribution: number[]
}

interface KeyValueTableProps {
  entries: React.ReactNode[][]
}
const KeyValueTable = ({entries}: KeyValueTableProps) => (
  <Table>
    <TableBody>
      {entries.map((cells, i) => (
        <TableRow key={i}>
          {cells.map((cell, j) => (
            <TableCell key={j}>{cell}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

// TODO: The problem here is the format of the distribution
const Statistics = ({ distribution }: Props) => {
  const nonZeroValues = distribution.map((y, x) => ({y, x})).filter(({y}) => y > 0)
  const count = nonZeroValues.reduce((curr, {y}) => curr + y, 0)
  const minVal = nonZeroValues.reduce((curr, {x}) => min(curr, x), +Infinity)
  const maxVal = nonZeroValues.reduce((curr, {x}) => max(curr, x), -Infinity)
  const mean = nonZeroValues.map(({x, y}) => x*y).reduce((a, b) => a+b, 0) / count

  const entries = [
    ["min", <ScientificNotation value={minVal} />],
    ["max", <ScientificNotation value={maxVal} />],
    ["mean", <ScientificNotation value={mean} />]
  ]

  return <KeyValueTable entries={entries} />
}

export default Statistics
