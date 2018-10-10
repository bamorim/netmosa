import * as d3 from 'd3';
import * as sha256 from 'fast-sha256';
import {Stream} from 'xstream';

import {ReadGraph} from './Model';
import { body } from '@cycle/dom';

export type Input = Stream<{container: Element, graph?: ReadGraph}>;

const linkStrength = 2000;
const bodyStrength = -100;

export function driver(
    input$: Stream<{container: Element, graph?: ReadGraph}>) {
  let graphView: GraphView|undefined;
  let lastContainer: Element|undefined;
  let lastKey = '';
  input$.subscribe({
    next: ({container, graph}) => {
      if (!container || !document.body.contains(container)) {
        graphView = undefined;
        return;
      }

      if (!graphView || container !== lastContainer) {
        lastContainer = container;
        lastKey = '';
        graphView = new GraphView(container);
      }

      const nextKey = graph ? graphKey(graph) : '';

      if (lastKey !== nextKey) {
        lastKey = nextKey;
        if (graph !== undefined) {
          graphView.updateGraph(graph);
        } else {
          graphView.reset();
        }
      }
    }
  });
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const graphKey = (graph: ReadGraph) =>
    decoder.decode(sha256.hash(encoder.encode(JSON.stringify({
      edges: graph.edges,
      nodes: graph.vertices.map(({attributes}) => Array.from(attributes))
    }))));

interface Node extends d3.SimulationNodeDatum {
  id: string;
  attributes: Map<string, string>;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
}

function isNode(node: Node|string|number|{}|undefined): node is Node {
  return node !== undefined && (node as Node).id !== undefined;
}

class GraphView {
  private nodes: Node[] = [];
  private links: Link[] = [];
  private force: d3.Simulation<{}, Link>;
  private svg: d3.Selection<d3.BaseType, {}, null, undefined>;
  private transformationGroup: d3.Selection<d3.BaseType, {}, null, undefined>;
  private linkSelection: d3.Selection<SVGLineElement, Link, d3.BaseType, {}>;
  private nodeSelection: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}>;

  constructor(container: Element) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.force = d3.forceSimulation()
                     .nodes(this.nodes)
                     .force('charge', d3.forceManyBody().strength(bodyStrength))
                     .force(
                         'link',
                         d3.forceLink(this.links)
                            .strength(linkStrength)
                             .id((d: Node|{}) => isNode(d) ? d.id : ''))
                     .force('center', d3.forceCenter(width / 2, height / 2));

    this.svg = d3.select(container)
                   .append('svg')
                   .attr('width', '100%')
                   .attr('height', '100%');

    this.transformationGroup = this.svg.append('g');

    this.linkSelection = this.transformationGroup.append('g')
                             .attr('stroke', '#000')
                             .attr('stroke-width', 1.5)
                             .selectAll('.link');

    this.nodeSelection = this.transformationGroup.append('g')
                             .attr('stroke', '#fff')
                             .attr('stroke-width', 1.5)
                             .selectAll('.node');

    this.update();
  }

  updateGraph(graph: ReadGraph) {
    let maxNode = 0;
    const newNodes: {[index: number]: number} = {};

    graph.edges.map((e) => [Math.min(...e), Math.max(...e)]).forEach(([
                                                                       min, max
                                                                     ]) => {
      if (!newNodes[min]) newNodes[min] = min;
      if (!newNodes[max]) newNodes[max] = min;
      if (maxNode < min) maxNode = min;
      if (maxNode < max) maxNode = max;
    });
    const nodeCount = maxNode + 1;

    // Sync Nodes
    graph.vertices.forEach((vertex) => {
      if (!this.nodes[vertex.id]) {
        const neighborId =
            vertex.neighbors.find((v) => v < vertex.id) || vertex.neighbors[0];
        const neighbor = this.nodes[neighborId || 0];
        const copiedProps = neighbor ? {x: neighbor.x, y: neighbor.y} : {};
        this.nodes[vertex.id] = {
          ...copiedProps,
          id: vertex.id.toString(),
          attributes: new Map(vertex.attributes)
        };
      } else {
        this.nodes[vertex.id].attributes = new Map(vertex.attributes);
      }
    });

    // Sync Edges
    this.links = graph.edges.map(([from, to], index) => ({
                                   ...(this.links[index] || {}),
                                   source: this.nodes[from],
                                   target: this.nodes[to],
                                   id: index.toString()
                                 }));

    this.update();
  }

  reset() {
    this.links = [];
    this.nodes = [];
    this.update();
  }

  ticked =
      () => {
        this.linkSelection
            .attr('x1', (d: Link) => isNode(d.source) ? d.source.x || 0 : 0)
            .attr('y1', (d: Link) => isNode(d.source) ? d.source.y || 0 : 0)
            .attr('x2', (d: Link) => isNode(d.target) ? d.target.x || 0 : 0)
            .attr('y2', (d: Link) => isNode(d.target) ? d.target.y || 0 : 0);

        this.nodeSelection.attr('cx', (d: Node) => d.x || 0)
            .attr('cy', (d: Node) => d.y || 0)
            .attr(
                'fill',
                (node: Node) => node.attributes.get('color') || 'white');
        this.fit()
      }

  dragstarted =
      (d: Node) => {
        if (!d3.event.active) this.force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

  dragged =
      (d: Node) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

  dragended =
      (d: Node) => {
        if (!d3.event.active) this.force.alphaTarget(0);

        d.fx = null;
        d.fy = null;
      }

  private fit() {
    const rootNode = this.transformationGroup.node() as SVGGraphicsElement
    const bounds = rootNode.getBBox();
    const parent = rootNode.parentElement;
    const fullWidth = parent!.clientWidth,
        fullHeight = parent!.clientHeight;
    const width = bounds.width,
        height = bounds.height;
    const midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    const scale = Math.min(1, 0.95 / Math.max(width / fullWidth, height / fullHeight));
    const translationX = fullWidth / 2 - scale * midX;
    const translationY = fullHeight / 2 - scale * midY;
    this.transformationGroup.attr(
      "transform",
      "translate(" + translationX + "," + translationY + ")scale(" + scale + ")"
    );

  }

  private update() {
    const linkData = this.linkSelection.data(this.links);
    linkData.exit().remove();
    this.linkSelection = linkData.enter().append<SVGLineElement>('line').merge(
        this.linkSelection);

    const nodeData = this.nodeSelection.data(this.nodes);
    nodeData.exit().remove();
    this.nodeSelection = nodeData.enter()
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