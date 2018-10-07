import * as d3 from 'd3';
import { max } from 'd3';
import {RenderableGraph} from "./Simulator";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  color?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
}

function isNode(node: Node | string | number | {} | undefined): node is Node {
  return node !== undefined && (node as Node).id !== undefined;
}

export class GraphView {
  private nodes: Node[] = [];
  private links: Link[] = [];
  private force: d3.Simulation<any, any>;
  private svg: d3.Selection<any, any, any, any>;
  private linkSelection: d3.Selection<SVGLineElement, Link, d3.BaseType, {}>;
  private nodeSelection: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}>;

  constructor(container: Element) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.force = d3.forceSimulation()
      .nodes(this.nodes)
      .force('charge', d3.forceManyBody().strength(-150))
      .force(
        'link',
        d3.forceLink(this.links).id((d: Node | {}) => isNode(d) ? d.id : ''))
      .force('center', d3.forceCenter(width / 2, height / 2));

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    this.linkSelection =
      this.svg.append('g')
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5)
        .selectAll('.link');

    this.nodeSelection =
      this.svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('.node');

    this.update();
  }

  updateGraph(graph: RenderableGraph) {
    let maxNode = 0
    let newNodes : {[index: number]: number} = {}
    graph.edges.map((e) => [Math.min(...e), Math.max(...e)]).forEach(([min, max]) => {
      if(!newNodes[min]) newNodes[min] = min
      if(!newNodes[max]) newNodes[max] = min
      if(maxNode < min) maxNode = min
      if(maxNode < max) maxNode = max
    })
    let nodeCount = maxNode + 1

    // Sync Nodes
    while (this.nodes.length != nodeCount) {
      if(this.nodes.length < nodeCount) {
        const existingNode = this.nodes[newNodes[this.nodes.length]] || {}
        const newNode = { id: this.nodes.length.toString(), x: existingNode.x, y: existingNode.y }
        this.nodes.push(newNode)
      } else {
        //this.nodes.pop()
      }
    }

    // Sync colors
    this.nodes.forEach((node) => delete node.color)
    graph.colorings.forEach(([node, color]) => this.nodes[node].color = color)

    // Sync Edges
    this.links = graph.edges.map(([from, to], index) => ({
      ...(this.links[index] || {}),
      source: this.nodes[from],
      target: this.nodes[to],
      id: index.toString()
    }));


    Object.assign(window, {links: this.links, nodes: this.nodes});
    this.update();
  }

  reset() {
    this.links = []
    this.nodes = []
    this.update();
  }

  ticked = () => {
    this.linkSelection
      .attr('x1', (d: Link) => isNode(d.source) ? d.source.x || 0 : 0)
      .attr('y1', (d: Link) => isNode(d.source) ? d.source.y || 0 : 0)
      .attr('x2', (d: Link) => isNode(d.target) ? d.target.x || 0 : 0)
      .attr('y2', (d: Link) => isNode(d.target) ? d.target.y || 0 : 0);

    this.nodeSelection
      .attr('cx', (d: Node) => d.x || 0)
      .attr('cy', (d: Node) => d.y || 0)
      .attr('fill', (node: Node) => node.color || "white");
  }

  dragstarted = (d: Node) => {
    if (!d3.event.active) this.force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged = (d: Node) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended = (d: Node) => {
    if (!d3.event.active) this.force.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  }

  private update() {
    let linkData = this.linkSelection.data(this.links);
    linkData.exit().remove();
    this.linkSelection = linkData
      .enter()
      .append<SVGLineElement>('line')
      .merge(this.linkSelection);

    let nodeData = this.nodeSelection.data(this.nodes);
    nodeData.exit().remove();
    this.nodeSelection = nodeData
      .enter()
      .append<SVGCircleElement>('circle')
      .attr('r', 8)
      .attr('stroke', 'black')
      .call(d3.drag()
        .on('start', this.dragstarted)
        .on('drag', this.dragged)
        .on('end', this.dragended))
      .merge(this.nodeSelection);


    this.force.nodes(this.nodes).on('tick', this.ticked);
    this.force.force('link', d3.forceLink(this.links));
    this.force.restart();
    this.force.alpha(0.1);
  }
}