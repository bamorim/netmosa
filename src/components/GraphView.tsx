import * as React from 'react'
import * as d3 from 'd3'
import { ReadGraph, Change } from 'graph'
import { useLayoutEffect, useRef } from 'react'
import { createStyles, withStyles } from '@material-ui/core'
import { Subscription } from 'rxjs';

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  hidden: {
    display: 'none'
  }
})

interface Props {
  graph: ReadGraph
  show: boolean
  classes: Record<keyof typeof styles, string>
}

const GraphView = ({ graph, show, classes }: Props) => {
  const container = useRef(null)
  const className = show
    ? classes.container
    : `${classes.container} ${classes.hidden}`

  useLayoutEffect(
    () => {
      const graphView = new GraphViewD3(container.current!, graph)
      return () => graphView.cleanup()
    },
    [graph]
  )

  return <div className={className} ref={container} />
}

export default withStyles(styles)(GraphView)

interface Node extends d3.SimulationNodeDatum {
  index: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
  index: number
  source: Node
  target: Node
}

class GraphViewD3 {
  private graph: ReadGraph
  private nodes: Node[] = []
  private links: Link[] = []
  private force: d3.Simulation<Node, Link>
  private transformationGroup: d3.Selection<d3.BaseType, {}, null, undefined>
  private linkLines: d3.Selection<SVGLineElement, Link, d3.BaseType, {}>
  private nodeCircles: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}>
  private subscription: Subscription

  constructor(container: Element, graph: ReadGraph) {
    this.graph = graph
    const width = container.clientWidth
    const height = container.clientHeight
    const bodyStrength = -100
    const linkStrength = 0.5
    this.subscription = this.graph.subject.subscribe(this.onChange)

    this.force = d3
      .forceSimulation<Node, Link>()
      .nodes(this.nodes)
      .on('tick', this.ticked)
      .force('charge', d3.forceManyBody().strength(bodyStrength))
      .force('link',
        d3
        .forceLink<Node, Link>(this.links)
        .strength(linkStrength)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))

    this.transformationGroup = d3
    .select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .append('g')

    this.linkLines = this.transformationGroup
      .append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('fill', 'transparent')
      .selectAll('.link')

    this.nodeCircles = this.transformationGroup
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('.node')

    this.update()
  }

  public cleanup() {
    this.subscription.unsubscribe()
  }

  private onChange = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        const vertex = this.graph.vertices[change.id]
        const neighborId = vertex.neighbors[0]
        const neighbor = this.nodes[neighborId || 0]
        const copiedProps = neighbor ? { x: neighbor.x || 0, y: neighbor.y || 0 } : {x: 0, y: 0}
        this.nodes[change.id] = {
          ...copiedProps,
          index: change.id
        }
        break
      case 'AddedEdge':
        const [a, b] = this.graph.edges[change.id]
        this.links[change.id] = {
          source: this.nodes[a],
          target: this.nodes[b],
          index: change.id
        }
        break
      default:
    }

    this.update()
  }

  private ticked = () => {
    this.linkLines.attr('d', (d: Link) => {
      const isSelfLoop = d.source.index === d.target.index
      const x1 = d.source.x || 0
      const y1 = d.source.y || 0
      const x2 = d.target.x || 0
      const y2 = d.target.y || 0

      if (isSelfLoop) {
        return `M${x1},${y1} a8,8 0 1,1 1,0`
      } else {
        return `M${x1},${y1} L ${x2},${y2}`
      }
    })

    this.nodeCircles
      .attr('cx', (d: Node) => d.x || 0)
      .attr('cy', (d: Node) => d.y || 0)
      .attr('fill', (node: Node) => this.graph.vertices[node.index].attributes.get('color') || 'white')

    this.fit()
  }

  private update = () => {
    const linkJoin = this.linkLines.data(this.links)

    // Just remove old link lines
    linkJoin.exit().remove()

    // Create new link lines
    this.linkLines = linkJoin
      .enter()
      .append<SVGLineElement>('path')
      .merge(this.linkLines)

    const nodeJoin = this.nodeCircles.data(this.nodes)

    // Just remove old node circles
    nodeJoin.exit().remove()

    // Create new node circles
    this.nodeCircles = nodeJoin
      .enter()
      .append<SVGCircleElement>('circle')
      .attr('r', 8)
      .attr('stroke', 'black')
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      )
      .merge(this.nodeCircles)

    // Update force nodes
    this.force.nodes(this.nodes)

    // Update link force links
    const forceLink = this.force.force('link') as d3.ForceLink<Node, Link>
    forceLink.links(this.links)

    // Restart
    this.force.restart()
    this.force.alpha(0.1)
  }

  private dragstarted = (d: Node) => {
    if (!d3.event.active) {
      this.force.alphaTarget(0.3).restart()
    }
    d.fx = d.x
    d.fy = d.y
  }

  /** Set fx/fy to fix the node in the mouse position */
  private dragged = (d: Node) => {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  /** Remove fx/fy after drag to stop dragging */
  private dragended = (d: Node) => {
    if (!d3.event.active) {
      this.force.alphaTarget(0)
    }

    d.fx = null
    d.fy = null
  }

  /** Scale the zoom to fit everything */
  private fit() {
    const rootNode = this.transformationGroup.node() as SVGGraphicsElement
    const bounds = rootNode.getBBox()
    const parent = rootNode.parentElement
    const fullWidth = parent!.clientWidth
    const fullHeight = parent!.clientHeight
    const width = bounds.width
    const height = bounds.height
    const midX = bounds.x + width / 2
    const midY = bounds.y + height / 2
    if (width === 0 || height === 0) {
      return // nothing to fit
    }
    const scale = Math.min(
      1,
      0.95 / Math.max(width / fullWidth, height / fullHeight)
    )
    const translationX = fullWidth / 2 - scale * midX
    const translationY = fullHeight / 2 - scale * midY
    this.transformationGroup.attr(
      'transform',
      'translate(' + translationX + ',' + translationY + ')scale(' + scale + ')'
    )
  }
}
