import { ReadGraph, Model, AdjacencyListGraph } from "./Model";
import xs, { Stream } from "xstream";
import { MainDOMSource, VNode, h } from "@cycle/dom";

// Component Interface
export interface Sources {
  DOM: MainDOMSource;
  props$: Stream<Props>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  action$: Stream<Action>;
  state$: Stream<State>;
  graphViewContainer$: Stream<Element>;
}

export interface Props {
  model: Model
}

export interface State {
  graph: ReadGraph;
  paused: boolean;
  speed: number;
}

// Actions
interface Play { type: "Play"; }
interface Pause { type: "Pause"; }

interface ChangeSpeed {
  type: "ChangeSpeed";
  speed: number;
}

type Action = Play | Pause | ChangeSpeed;

const periodFromSpeed = (speed: number) => 10 + 4 * (100 - speed);

function model(props$: Stream<Props>, action$: Stream<Action>): Stream<State> {
  const paused$ = action$
    .filter((a) => a.type == 'Play' || a.type == 'Pause')
    .map((a) => a.type == 'Pause')
    .startWith(false)

  const speed$ = action$
    .filter((a) => a.type == 'ChangeSpeed')
    .map((s: ChangeSpeed) => s.speed)
    .startWith(0);

  const tick$ =
      xs.combine(paused$, speed$)
          .map(
              ([paused, speed]) =>
                  paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
          .flatten()
          .startWith({})

  const runningSimulation$ = props$.map(({model}) => model(new AdjacencyListGraph()));

  const graph$ = xs
    .combine(tick$, runningSimulation$)
    .map(([tick, simulation]) => simulation.next().value)

  const state$ = xs
      .combine(paused$, speed$, graph$)
      .map(([paused, speed, graph]) => ({ paused, speed, graph }));

  return state$
}

function cdf(distribution: number[]) {
  const sum = distribution.reduce((acc, c) => acc + c, 0)
  return distribution.reduce(
      (arr: number[], v: number) => arr.concat([v + arr[arr.length - 1] || 0]),
      []
  ).map((v) => v / sum)
}

function icdf(distribution: number[]) {
  return cdf(distribution).map((v) => 1 - v)
}

function viewDistribution(distribution: number[], show: boolean) {
  const rows = icdf(distribution).map((v, i) => [i.toString(), v])
  const cols = [{ "label": "Degree", "type": "string" }, { "label": "%", "type": "number" }]
  const options = {
      title: "Degree Distribution",
      vAxis: {
          logScale: true
      }
  }

  return h('div.sidebar', {attrs: {style: show ? "" : "display: none"}}, [
      h('google-chart', {
          attrs: {
              type: 'line',
              options: JSON.stringify(options),
              cols: JSON.stringify(cols),
              rows: JSON.stringify(rows)
          }
      }, [])
  ])
}

function pureView(state: State): VNode {
  const pauseUnpauseButton = state.paused ?
      h('div.item.intent-play', [h('i.violet.play.icon'), 'Play']) :
      h('div.item.intent-pause', [h('i.violet.pause.icon'), 'Pause']);

  const stopButton =
      h('div.item.intent-stop', [h('i.violet.stop.icon'), 'Stop']);

  const speedSlider =
      h('div.ui.form', [h('div.field', { attrs: { style: 'text-align: center' } }, [
          h('label', ['Speed']),
          h('input.speed',
              { attrs: { type: 'range', min: 0, max: 100, value: state.speed } }, [])
      ])]);

  const controls =
      h('div.ui.top.mini.labeled.icon.menu',
          [h('div.right.menu',
              [pauseUnpauseButton, stopButton, h('div.item', [speedSlider])])]);

  const statistics = viewDistribution(state.graph.degreeDistribution, true);

  return h('div.vlayout', [
      controls,
      h('div.hlayout', [
          h('div.graphview', []),
          statistics
      ])
  ]);
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) => pureView(state));
}

function intent({ DOM }: Sources): Stream<Action> {
  const changeSpeed$: Stream<ChangeSpeed> =
    DOM.select('input.speed').events('change').map<ChangeSpeed>((ev) => {
        const speed = +(ev.target as HTMLInputElement).value;
        return {type: "ChangeSpeed", speed};
    })

    const pause$ = DOM.select('.intent-pause').events('click').mapTo<Pause>({type: "Pause"})
    const play$ = DOM.select('.intent-play').events('click').mapTo<Play>({type: "Play"})

  return xs.merge(changeSpeed$, pause$, play$)
}

export default function Visualization(sources: Sources): Sinks {
    const action$ = intent(sources);
    const state$ = model(sources.props$, action$);
    const view$ = view(state$);

    // TODO: Use web components here as well
    const graphViewContainer$ = sources.DOM.select('.graphview').element();

    return {
        DOM: view$,
        graphViewContainer$,
        action$,
        state$
    };
}