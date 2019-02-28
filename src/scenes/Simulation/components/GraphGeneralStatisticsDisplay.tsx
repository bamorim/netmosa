import * as React from 'react'
import { Subscription } from 'rxjs'
import { sampleTime } from 'rxjs/operators'

import { ReadGraph, Change } from 'graph/index'
import { Chip, Avatar, withStyles } from '@material-ui/core'

export interface Props {
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
}

const styles = {
  chip: {
    margin: '5px'
  }
}

interface State {
  edgeCount: number
  nodeCount: number
}

class GraphGeneralStatistics extends React.Component<Props, State> {
  private subscription: Subscription

  public state: State = {
    edgeCount: 0,
    nodeCount: 0
  }

  public componentDidMount() {
    this.subscription = this.props.graph.change$
      .pipe(sampleTime(200)) // Performance tweaking
      .subscribe((change: Change) => {
        this.setState({
          nodeCount: this.props.graph.vertices.length,
          edgeCount: this.props.graph.edges.length
        })
      })

  }

  public componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  public render() {
    return (
      <>
        <Chip className={this.props.classes.chip} avatar={<Avatar>{this.state.nodeCount}</Avatar>} label="Vertices" />
        <Chip className={this.props.classes.chip} avatar={<Avatar>{this.state.edgeCount}</Avatar>} label="Edges" />
      </>
    )
  }
}

export default withStyles(styles)(GraphGeneralStatistics)
