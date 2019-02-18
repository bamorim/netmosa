import * as React from 'react'
import { Table, TableBody, TableRow, TableCell } from '@material-ui/core'

interface Props {
  entries: React.ReactNode[][]
}

const KeyValueTable = ({ entries }: Props) => (
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

export default KeyValueTable
