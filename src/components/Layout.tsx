import * as React from 'react'
import { ReactNode } from 'react'
import {
  Toolbar,
  Typography,
  AppBar,
  createStyles,
  withStyles,
  colors
} from '@material-ui/core'

const styles = createStyles({
  grow: {
    flexGrow: 1
  },
  container: {
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    maxWidth: '100%'
  },
  appbar: {
    backgroundColor: colors.grey[300]
  }
})

interface Props {
  classes: Record<keyof typeof styles, string>
  actions: ReactNode
  children: ReactNode
}

const Layout = (props: Props) => (
  <div className={props.classes.container}>
    <div>
      <AppBar position="static" className={props.classes.appbar}>
        <Toolbar>
          <Typography
            variant="h6"
            color="inherit"
            className={props.classes.grow}
          >
            Netmosa
          </Typography>
          {props.actions}
        </Toolbar>
      </AppBar>
    </div>
    {props.children}
  </div>
)

export default withStyles(styles)(Layout)
