import * as React from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  createStyles,
  withStyles
} from '@material-ui/core'

interface Props {
  entries: React.ReactNode[][]
  classes: Record<keyof typeof styles, string>
}

const styles = createStyles({
  row: {
    height: 'auto !important'
  }
})

const KeyValueTable = ({ entries, classes }: Props) => (
  <Table padding="dense">
    <TableBody>
      {entries.map((cells, i) => (
        <TableRow key={i} classes={{ root: classes.row }}>
          {cells.map((cell, j) => (
            <TableCell key={j}>{cell}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default withStyles(styles)(KeyValueTable)
