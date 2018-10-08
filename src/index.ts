import { h, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/run';
import { Stream } from 'xstream';
import xs from 'xstream';

import { randomWalkModel } from './Models';
import * as graphView from "./GraphView";
import { IReadGraph, Graph } from './Model';

interface AppState {
  paused: boolean,
  speed: number,
  runningSimulation?: IterableIterator<IReadGraph>,
  currentGraph?: IReadGraph
}

interface Intents {
  pause$: Stream<any>,
  play$: Stream<any>,
  changeSpeed$: Stream<number>
}

const periodFromSpeed = (speed: number) => 200 + 6 * (100 - speed)

function model(intents: Intents): Stream<AppState> {
  const paused$ = xs.merge(
    intents.play$.mapTo(false),
    intents.pause$.mapTo(true)
  ).startWith(false)

  const speed$ = intents.changeSpeed$.startWith(0)

  const runningSimulation$ = xs.of(randomWalkModel(new Graph(), 2))

  const tick$ = xs.combine(paused$, speed$)
    .map(([paused, speed]) => paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
    .flatten()

  const graph$ = xs
    .combine(runningSimulation$, tick$)
    .map<IReadGraph>(([runningSimulation, _]) => runningSimulation.next().value)

  return xs
    .combine(paused$, speed$, runningSimulation$, graph$)
    .map(([paused, speed, runningSimulation, currentGraph]) => ({
      paused, speed, runningSimulation, currentGraph
    }))
}

// View

interface View {
  dom: Stream<VNode>;
  graphView: graphView.Input;
}

function view(dom: MainDOMSource, state$: Stream<AppState>): View {
  const container$ = dom.select('.graphview').element()

  const configView = (state: AppState) => h('div.ui.form', [
    state.paused ? (
      h('button.ui.icon.basic.violet.labeled.button.intent-play', [h('i.play.icon'), "Play"])
    ) : (
        h('button.ui.icon.basic.violet.labeled.button.intent-pause', [h('i.pause.icon'), "Pause"])
      ),
    h('div.field', [
      h('label', ["Speed"]),
      h('input.speed', {
        attrs: { type: 'range', min: 0, max: 100, value: state.speed }
      }, [])
    ])
  ])

  const view$ = state$.map((state) => h('div.wrapper', [
    h('div.graphview', []),
    h('div.menu', [
      configView(state)
    ])
  ]));

  const graphView$ = xs.combine(state$, container$)
    .map(([state, container]) => ({ graph: state.currentGraph, container }))

  return {
    dom: view$,
    graphView: graphView$
  }
}

// Intent

function intent(dom: MainDOMSource): Intents {
  return {
    changeSpeed$: dom
      .select('input.speed')
      .events('change')
      .map(ev => {
        let x = parseInt((ev.target as HTMLInputElement).value)
        return x;
      })
      .startWith(0),
    pause$: dom
      .select('.intent-pause')
      .events('click'),
    play$: dom
      .select('.intent-play')
      .events('click')
  }
}

// Program

interface Sources {
  dom: MainDOMSource;
}

type Sinks = View

function main(sources: Sources): Sinks {
  return view(sources.dom, model(intent(sources.dom)));
}

const drivers = {
  dom: makeDOMDriver('#app'),
  graphView: graphView.driver
};

run(main, drivers);