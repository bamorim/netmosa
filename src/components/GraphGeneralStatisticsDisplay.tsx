import * as React from 'react'
import { Subscription } from 'rxjs'
import { sampleTime } from 'rxjs/operators'
import { ReadGraph, Change } from '../graph'

export interface Props {
  graph: ReadGraph
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
    this.subscription = this.props.graph
      .asObservable()
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
      <div>
        N: {this.state.nodeCount}
        <br />
        E: {this.state.edgeCount}
      </div>
    )
  }
}

export default GraphGeneralStatistics
