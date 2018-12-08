import * as React from 'react';
import { ReactNode } from 'react';
import { Toolbar, Typography, AppBar, Button, createStyles, withStyles } from '@material-ui/core';

const styles = createStyles({
  grow: {
    flexGrow: 1
  }
})

interface Props {
  classes: Record<keyof typeof styles, string>,
  actions: ReactNode,
  children: ReactNode
}

const Layout = (props: Props) => (
  <div className="v-fill">
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={props.classes.grow}>
            rggvis
        </Typography>
          {props.actions}
        </Toolbar>
      </AppBar>
    </div>
    {props.children}
  </div>
);

export default withStyles(styles)(Layout);
