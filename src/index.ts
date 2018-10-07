import { h, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/run';
import { Stream, Listener } from 'xstream';
import * as sha256 from "fast-sha256";
import xs from 'xstream';

import { randomWalkModel } from './Models';
import { Graph, IGraph, IVertex, Model } from './Model';
import { GraphView } from "./GraphView";
import { Action } from './Simulation';
import * as simulation from "./Simulation";

interface Sources {
  dom: MainDOMSource;
  simulation: Stream<IGraph>;
}

interface Sinks {
  dom: Stream<VNode>;
  graphView: Stream<{ container: Element, state: IGraph | null }>;
  simulation: Stream<Action>;
}

interface AppState {
  paused: boolean,
  speed: number
}

function main(sources: Sources): Sinks {
  const pauseClick$ = sources.dom
    .select('button.pause')
    .events('click')

  const paused$ = pauseClick$.fold((paused, _) => !paused, false)

  const speedChange$: Stream<number> =
    sources.dom
      .select('input.speed')
      .events('change')
      .map(ev => {
        let x = parseInt((ev.target as HTMLInputElement).value)
        console.log(x)
        return x;
      })
      .startWith(0)

  const state$: Stream<AppState> = xs.combine(paused$, speedChange$)
    .map(([paused, speed]) => ({ paused, speed }))
    .startWith({ paused: false, speed: 0 });

  const configView = (state: AppState) => h('div.ui.form', [
    h('button.pause.ui.icon.basic.violet.labeled.button',
      state.paused ? [h('i.play.icon'), "Play"] : [h('i.pause.icon'), "Pause"]
    ),
    h('div.field', [
      h('label', ["Speed"]),
      h('input.speed', {
        attrs: { type: 'range', min: 0, max: 100, value: state.speed }
      }, [])
    ])
  ])

  const view$ = state$.map((state) =>
    h('div.wrapper', [
      h('div.graphview', []),
      h('div.menu', [
        configView(state)
      ])
    ])
  );

  const container$ = sources.dom.select('.graphview').element()

  const graphView$ = xs.combine(sources.simulation, container$)
    .map(([state, container]) => ({ state, container }))

  const periodFromSpeed = (speed: number) => 200 + 8 * (100 - speed)

  const simulationAction$ = state$
    .map(({ paused, speed }) => paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
    .flatten()
    .mapTo<Action>(simulation.tick)
    .startWith(simulation.startSimulation(randomWalkModel, [2]))

  const sinks: Sinks = {
    dom: view$,
    graphView: graphView$,
    simulation: simulationAction$
  };
  return sinks;
}

const drivers = {
  dom: makeDOMDriver('#app'),
  graphView: graphDriver,
  simulation: simulation.simulationDriver
};

run(main, drivers);

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const graphKey = (graph: IGraph) => decoder.decode(sha256.hash(encoder.encode(JSON.stringify({
  edges: graph.edges,
  nodes: graph.vertices.map(({attributes}) => Array.from(attributes))
}))))

function graphDriver(input$: Stream<{ container: Element, state: IGraph | null }>) {
  let graphView: GraphView | null;
  let lastKey: String = "";
  input$.subscribe({
    next: ({ container, state }) => {
      if (!container) {
        graphView = null;
        return;
      } else if (!graphView) {
        graphView = new GraphView(container);
      }

      let nextKey = state ? graphKey(state) : ""

      if (lastKey != nextKey) {
        lastKey = nextKey
        if (state != null) {
          graphView.updateGraph(state)
        } else {
          graphView.reset()
        }
      }
    }
  })
}