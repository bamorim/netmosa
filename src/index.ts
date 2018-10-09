import { h, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/run';
import { Stream } from 'xstream';
import xs from 'xstream';

import { randomWalkModel, luaModel, lineModelLua, lineModel } from './Models';
import * as graphView from "./GraphView";
import { IReadGraph, Graph } from './Model';

interface AppState {
  paused: boolean,
  speed: number,
  runningSimulation?: IterableIterator<IReadGraph>,
  currentGraph?: IReadGraph,
  script: string
}

interface Intents {
  pause$: Stream<any>,
  play$: Stream<any>,
  stop$: Stream<any>,
  start$: Stream<any>,
  changeSpeed$: Stream<number>,
  changeScript$: Stream<string>,
}

const periodFromSpeed = (speed: number) => 200 + 6 * (100 - speed)

function model(intents: Intents): Stream<AppState> {
  const paused$ = xs.merge(
    intents.play$.mapTo(false),
    intents.pause$.mapTo(true)
  ).startWith(false)

  const speed$ = intents.changeSpeed$.startWith(0)

  const simulationAction$ = xs.merge(
    intents.start$.mapTo('start'),
    intents.stop$.mapTo('stop')
  )

  const runningSimulation$ = xs
    .combine(simulationAction$, intents.changeScript$)
    .fold<IterableIterator<IReadGraph>|undefined>((runningSimulation, [action, code]) => {
      if(runningSimulation) {
        if(action == 'stop') return undefined
      } else {
        if(action == 'start') return luaModel(new Graph(), code)
      }
      return runningSimulation
    }, undefined)

  const tick$ = xs.combine(paused$, speed$)
    .map(([paused, speed]) => paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
    .flatten()

  const simulationStep$ = (simulation: IterableIterator<IReadGraph>) =>
    tick$.map<IReadGraph>(() => simulation.next().value)

  const graph$ = runningSimulation$
    .map((simulation) => simulation ? simulationStep$(simulation) : xs.of(undefined))
    .flatten()

  return xs
    .combine(paused$, speed$, runningSimulation$, graph$, intents.changeScript$)
    .map(([paused, speed, runningSimulation, currentGraph, script]) => ({
      paused, speed, runningSimulation, currentGraph, script
    }))
}

// Intent

function intent(dom: MainDOMSource): Intents {
  const scriptInput = dom.select('textarea.script-input')

  const scriptInputEvent$ = xs.merge(
    scriptInput.events('change'),
    scriptInput.events('keyup'),
    scriptInput.events('keypress')
  )

  return {
    changeSpeed$: dom
      .select('input.speed')
      .events('change')
      .map(ev => {
        let x = parseInt((ev.target as HTMLInputElement).value)
        return x;
      })
      .startWith(0),
    changeScript$: scriptInputEvent$
      .map(ev => (ev.target as HTMLInputElement).value)
      .startWith(lineModelLua),
    pause$: dom
      .select('.intent-pause')
      .events('click'),
    play$: dom
      .select('.intent-play')
      .events('click'),
    start$: dom
      .select('.intent-start')
      .events('click'),
    stop$: dom
      .select('.intent-stop')
      .events('click')
  }
}

// View

interface View {
  dom: Stream<VNode>;
  graphView: graphView.Input;
}

function view(dom: MainDOMSource, state$: Stream<AppState>): View {
  const container$ = dom.select('.graphview').element()

  const configView = (paused: boolean, speed: number) => h('div.ui.form', [
    paused ? (
      h('button.ui.icon.basic.violet.labeled.button.intent-play', [h('i.play.icon'), "Play"])
    ) : (
        h('button.ui.icon.basic.violet.labeled.button.intent-pause', [h('i.pause.icon'), "Pause"])
      ),
    h('button.ui.icon.basic.violet.labeled.button.intent-stop', [h('i.stop.icon'), "Stop"]),
    h('div.field', [
      h('label', ["Speed"]),
      h('input.speed', {
        attrs: { type: 'range', min: 0, max: 100, value: speed }
      }, [])
    ])
  ])

  const startView = (script: string) => h('div.ui.form', [
    h('div.field',[
      h('label', ["Script"]),
      h('textarea.script-input', {
        attrs: {
          rows: script.split("\n").length
        }
      }, [ script ])
    ]),
    h('button.ui.icon.basic.violet.labeled.button.intent-start', [h('i.play.icon'), "Start"])
  ])

  const view$ = state$.map((state) => state.runningSimulation ? h('div.wrapper', [
    h('div.graphview', []),
    h('div.menu', [configView(state.paused, state.speed)])
  ]) : h('div.setup', [startView(state.script)]));

  const graphView$ = xs.combine(state$, container$)
    .map(([state, container]) => ({ graph: state.currentGraph, container }))

  return {
    dom: view$,
    graphView: graphView$
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