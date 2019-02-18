import * as React from 'react'
import * as d3 from 'd3'
import { ReadGraph, Change, VertexId } from 'graph/index'
import { useLayoutEffect, useRef } from 'react'
import { createStyles, withStyles } from '@material-ui/core'
import { Subscription } from 'rxjs'
import { clearTimeout, setTimeout } from 'timers'

const styles = createStyles({
  container: {
    flex: '1'
  }
})

type HighlightChangeCallback = (vertex?: VertexId) => void

interface Props {
  graph: ReadGraph
  classes: Record<keyof typeof styles, string>
  onHighlightChange?: HighlightChangeCallback
}

const GraphView = ({ graph, classes, onHighlightChange }: Props) => {
  const container = useRef(null)
  useLayoutEffect(
    () => {
      const noop = () => null
      const onHighlightChangeWithFallback = onHighlightChange
        ? onHighlightChange
        : noop
      const graphView = new GraphViewD3(
        container.current!,
        graph,
        onHighlightChangeWithFallback
      )
      return () => graphView.destroy()
    },
    [graph]
  )

  return <div className={classes.container} ref={container} />
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
  private svg: d3.Selection<SVGSVGElement, {}, null, undefined>
  private transformationGroup: d3.Selection<d3.BaseType, {}, null, undefined>
  private linkLines: d3.Selection<SVGLineElement, Link, d3.BaseType, {}>
  private nodeCircles: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}>
  private zoom: d3.ZoomBehavior<Element, {}>
  private subscription: Subscription
  private onHighlightChange: HighlightChangeCallback

  // This is used to avoid disabling autozoom when autozooming
  private isAutozooming: boolean = false

  // This is to avoid autozoom if manual zoom occurs
  private autozoomDisabled: boolean = false
  private reenableAutozoomTimer?: NodeJS.Timeout

  constructor(
    container: Element,
    graph: ReadGraph,
    onHighlightChange: HighlightChangeCallback
  ) {
    this.graph = graph
    this.onHighlightChange = onHighlightChange
    const width = container.clientWidth
    const height = container.clientHeight
    const bodyStrength = -100
    const linkStrength = 0.5

    this.zoom = d3.zoom().on('zoom', this.zoomed)

    this.force = d3
      .forceSimulation<Node, Link>()
      .nodes(this.nodes)
      .on('tick', this.ticked)
      .force('charge', d3.forceManyBody().strength(bodyStrength))
      .force(
        'link',
        d3.forceLink<Node, Link>(this.links).strength(linkStrength)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))

    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(this.zoom)

    this.transformationGroup = this.svg.append('g')

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

    this.subscription = this.graph.subject.subscribe(this.onChange)
  }

  public destroy() {
    this.subscription.unsubscribe()
    this.force.stop()
    this.clearReenableAutozoomTimer()
  }

  private onChange = (change: Change) => {
    switch (change.type) {
      case 'AddedVertex':
        const vertex = this.graph.vertices[change.id]
        const neighborId = vertex.neighbors[0]
        const neighbor = this.nodes[neighborId || 0]
        const copiedProps = neighbor
          ? { x: neighbor.x || 0, y: neighbor.y || 0 }
          : { x: 0, y: 0 }
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
      .attr(
        'fill',
        (node: Node) =>
          this.graph.vertices[node.index].attributes.get('color') || 'white'
      )

    // Fit zoom
    if (!this.autozoomDisabled) {
      this.autozoom()
    }
  }

  private update() {
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
      .on('mouseover', this.mouseover)
      .on('mouseout', this.mouseout)
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

  private mouseover = (hovered: Node) => {
    this.onHighlightChange(hovered.index)
    const neighbors = new Set(this.graph.vertices[hovered.index].neighbors)
    const highlightNode = (node: Node) =>
      node === hovered || neighbors.has(node.index)
    const highlightLink = (link: Link) =>
      link.source === hovered || link.target === hovered

    const transition = d3.transition().duration(200)

    this.nodeCircles
      .transition(transition)
      .style('opacity', (node: Node) => (highlightNode(node) ? 1.0 : 0.2))

    this.linkLines
      .transition(transition)
      .style('opacity', (link: Link) => (highlightLink(link) ? 1.0 : 0.2))
  }

  private mouseout = (node: Node) => {
    this.onHighlightChange()
    const transition = d3.transition().duration(200)
    this.nodeCircles.transition(transition).style('opacity', 1.0)
    this.linkLines.transition(transition).style('opacity', 1.0)
  }

  private zoomed = () => {
    if (!this.isAutozooming) {
      this.disableAutozoom()
    }
    this.transformationGroup.attr('transform', d3.event.transform)
  }

  private disableAutozoom() {
    this.clearReenableAutozoomTimer()
    this.autozoomDisabled = true
    this.reenableAutozoomTimer = setTimeout(this.reenableAutozoom, 5000)
  }

  private reenableAutozoom = () => {
    this.autozoom()
    this.autozoomDisabled = false
  }

  private clearReenableAutozoomTimer() {
    if (this.reenableAutozoomTimer) {
      clearTimeout(this.reenableAutozoomTimer)
    }
  }

  /** Scale the zoom to fit everything */
  private autozoom() {
    const rootNode = this.transformationGroup.node() as SVGGraphicsElement
    const bounds = rootNode.getBBox()
    const parent = rootNode.parentElement
    const fullWidth =
      parent &&
      (parent.clientWidth ||
        (parent.parentElement && parent.parentElement.clientWidth))
    const fullHeight =
      parent &&
      (parent.clientHeight ||
        (parent.parentElement && parent.parentElement.clientHeight))

    if (!fullWidth || !fullHeight) {
      console.debug('Could not get parent dimensions')
      return
    }

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

    this.isAutozooming = true
    this.svg.call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(fullWidth / 2, fullHeight / 2)
        .scale(scale)
        .translate(-midX, -midY)
    )
    this.isAutozooming = false
  }
}