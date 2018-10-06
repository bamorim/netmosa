import { h, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import * as d3 from 'd3';
import { max } from 'd3';
import { Stream, MemoryStream, Listener } from 'xstream';
import xs from 'xstream';

import { Edge } from './Model';
import { randomWalkModel } from './Models';
import { Simulation } from './Simulator';

interface Sources {
  dom: MainDOMSource;
  simulation: Stream<Edge[]>;
}

interface Sinks {
  dom: Stream<VNode>;
  graphView: Stream<{ container: Element, state: RenderableGraph | null }>;
  simulation: Stream<any>;
}

interface AppState {
  paused: boolean,
  speed: number
}

function main(sources: Sources): Sinks {
  const pauseChange$ =
    sources.dom
      .select('input.pause')
      .events('change')
      .map(ev => (ev.target as HTMLInputElement).checked)
      .startWith(false)

  const speedChange$ =
    sources.dom
      .select('input.speed')
      .events('change')
      .map(ev => {
        let x = parseInt((ev.target as HTMLInputElement).value)
        console.log(x)
        return x;
      })
      .startWith(0)

  const state$ = xs.combine(pauseChange$, speedChange$)
    .map(([paused, speed]) => ({ paused, speed }))
    .startWith({ paused: false, speed: 0 });

  const menuView$ = state$.map((state) =>
    h('div', [
      h('input.pause', { attrs: { type: 'checkbox' } }, []),
      h('label', [state.paused ? "Unpause" : "Pause"]),
      h('input.speed', { attrs: { type: 'range', min: 0, max: 100, value: state.speed } }, [])
    ])
  );
  const simulationView$ = state$.map(() => h('div.graphview', []));

  const view$ = xs.combine(menuView$, simulationView$).map(
    ([menu, simulation]) => h('div', [
      menu,
      simulation
    ])
  )

  const container$ = sources.dom.select('.graphview').element()

  const graphView$ = xs.combine(sources.simulation, container$)
    .map(([edges, container]) => ({ state: { edges }, container }))

  const periodFromSpeed = (speed: number) => 200 + 8 * (100 - speed)

  const simulationTick$ = state$
    .map(({ paused, speed }) => paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
    .flatten()

  const sinks: Sinks = {
    dom: view$,
    graphView: graphView$,
    simulation: simulationTick$
  };
  return sinks;
}

const drivers = {
  dom: makeDOMDriver('#app'),
  graphView: graphDriver,
  simulation: simulationDriver
};

run(main, drivers);

interface Node extends d3.SimulationNodeDatum {
  id: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: string;
}

function simulationDriver(input$: Stream<any>) {
  const simulation = new Simulation({ pos: 0 }, randomWalkModel(2));
  let inputListener: Partial<Listener<any>> | null = null;

  return adapt(xs.create({
    start: function(listener) {
      inputListener = {
        next: (received) => {
          listener.next(simulation.next().value.edges)
        }
      }
      input$.addListener(inputListener)
    },
    stop: () => {
      if (inputListener != null) input$.removeListener(inputListener)
    }
  }))
}

interface RenderableGraph {
  edges: Edge[]
}

function graphDriver(input$: Stream<{ container: Element, state: RenderableGraph | null }>) {
  let graphView: GraphView | null;
  let lastLength: number = 0;
  input$.subscribe({
    next: ({ container, state }) => {
      if (!container) {
        graphView = null;
        return;
      } else if (!graphView) {
        graphView = new GraphView(container);
      }

      if (state != null) {
        if (lastLength < state.edges.length) {
          state.edges.slice(lastLength).forEach((edge) => graphView && graphView.addLink(edge))
          lastLength = state.edges.length;
        }
      } else {
        graphView && graphView.reset()
      }
    }
  })
}

function isNode(node: Node | string | number | {}): node is Node {
  return (node as Node).id !== undefined;
}

class GraphView {
  private nodes: Node[] = [];
  private links: Link[] = [];
  private force: d3.Simulation<any, any>;
  private svg: d3.Selection<any, any, any, any>;
  private linkSelection: d3.Selection<SVGLineElement, Link, d3.BaseType, {}>;
  private nodeSelection: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}>;

  constructor(container: Element) {
    const width = 600;
    const height = 300;

    this.force = d3.forceSimulation()
      .nodes(this.nodes)
      .force('charge', d3.forceManyBody().strength(-150))
      .force(
        'link',
        d3.forceLink(this.links).id((d: Node | {}) => isNode(d) ? d.id : ''))
      .force('center', d3.forceCenter(width / 2, height / 2));

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

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

  addLink(value: Edge) {
    const nodeMax = max(value) || 0;
    const fromId = value[0].toString();
    const toId = value[1].toString();

    const existingNode = this.nodes[value[0]] || this.nodes[value[1]] || {};

    while (this.nodes.length <= nodeMax) {
      const newNode = { id: this.nodes.length.toString(), x: existingNode.x, y: existingNode.y }
      this.nodes.push(newNode)
    }

    this.links.push({ source: fromId, target: toId, id: this.links.length.toString() });
    this.update();
  }

  reset() {
    this.links = []
    this.nodes = []
    this.update();
  }

  ticked = () => {
    this.linkSelection.attr('x1', (d: Link) => isNode(d.source) ? d.source.x || 0 : 0)
      .attr('y1', (d: Link) => isNode(d.source) ? d.source.y || 0 : 0)
      .attr('x2', (d: Link) => isNode(d.target) ? d.target.x || 0 : 0)
      .attr('y2', (d: Link) => isNode(d.target) ? d.target.y || 0 : 0);

    this.nodeSelection.attr('cx', (d: Node) => d.x || 0).attr('cy', (d: Node) => d.y || 0);
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