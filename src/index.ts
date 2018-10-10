import {h, MainDOMSource, makeDOMDriver, VNode} from '@cycle/dom';
import {run} from '@cycle/run';
import {Stream} from 'xstream';
import xs from 'xstream';

import * as codeEditor from './CodeEditor';
import * as graphView from './GraphView';
import {AdjacencyListGraph, ReadGraph} from './Model';
import {luaModel} from './Models';

interface AppState {
  paused: boolean;
  speed: number;
  runningSimulation?: IterableIterator<ReadGraph>;
  currentGraph?: ReadGraph;
  script: string;
}

interface Intents {
  pause$: Stream<{}>;
  play$: Stream<{}>;
  stop$: Stream<{}>;
  start$: Stream<{}>;
  changeSpeed$: Stream<number>;
  changeScript$: Stream<string>;
}

const periodFromSpeed = (speed: number) => 100 + 4 * (100 - speed);

function model(intents: Intents): Stream<AppState> {
  const paused$ = xs.merge(
                        intents.play$.mapTo(false), intents.start$.mapTo(false),
                        intents.pause$.mapTo(true))
                      .startWith(false);

  const speed$ = intents.changeSpeed$.startWith(0);

  const simulationAction$ =
      xs.merge(intents.start$.mapTo('start'), intents.stop$.mapTo('stop'));

  const runningSimulation$ =
      xs.combine(simulationAction$, intents.changeScript$)
          .fold<IterableIterator<ReadGraph>|undefined>(
              (runningSimulation, [action, code]) => {
                if (runningSimulation) {
                  if (action === 'stop') {
                    return undefined;
                  }
                } else {
                  if (action === 'start') {
                    return luaModel(code)(new AdjacencyListGraph());
                  }
                }
                return runningSimulation;
              },
              undefined);

  const tick$ =
      xs.combine(paused$, speed$)
          .map(
              ([paused, speed]) =>
                  paused ? xs.empty() : xs.periodic(periodFromSpeed(speed)))
          .flatten();

  const simulationStep$ = (simulation: IterableIterator<ReadGraph>) =>
      tick$.map<ReadGraph>(() => simulation.next().value);

  const graph$ =
      runningSimulation$
          .map(
              (simulation) =>
                  simulation ? simulationStep$(simulation) : xs.of(undefined))
          .flatten();

  return xs
      .combine(
          paused$, speed$, runningSimulation$, graph$, intents.changeScript$)
      .map(
          ([paused, speed, runningSimulation, currentGraph, script]) =>
              ({paused, speed, runningSimulation, currentGraph, script}));
}

// Intent

function intent({dom, codeEditor}: Sources): Intents {
  const scriptInput = dom.select('textarea.script-input');

  return {
    changeSpeed$: dom.select('input.speed')
                      .events('change')
                      .map(ev => {
                        const x = +(ev.target as HTMLInputElement).value;
                        return x;
                      })
                      .startWith(0),
    changeScript$: codeEditor.startWith(''),
    pause$: dom.select('.intent-pause').events('click'),
    play$: dom.select('.intent-play').events('click'),
    start$: dom.select('.intent-start').events('click'),
    stop$: dom.select('.intent-stop').events('click')
  };
}

// View

interface View {
  dom: Stream<VNode>;
  graphView: graphView.Input;
  codeEditor: codeEditor.Input;
}

function simulationView(paused: boolean, speed: number): VNode {
  const pauseUnpauseButton = paused ?
      h('div.item.intent-play', [h('i.violet.play.icon'), 'Play']) :
      h('div.item.intent-pause', [h('i.violet.pause.icon'), 'Pause']);

  const stopButton =
      h('div.item.intent-stop', [h('i.violet.stop.icon'), 'Stop']);

  const speedSlider =
      h('div.ui.form', [h('div.field', {attrs: {style: 'text-align: center'}}, [
          h('label', ['Speed']),
          h('input.speed',
            {attrs: {type: 'range', min: 0, max: 100, value: speed}}, [])
        ])]);

  const controls =
      h('div.ui.top.mini.labeled.icon.menu',
        [h('div.right.menu',
           [pauseUnpauseButton, stopButton, h('div.item', [speedSlider])])]);

  return h('div.main', [controls, h('div.graphview', [])]);
}

function view(dom: MainDOMSource, state$: Stream<AppState>): View {
  const homeControlBar =
      h('div.home-control-bar', [h('button.ui.icon.labeled.button.intent-start',
                                   [h('i.play.icon'), 'Start'])]);

  const homeView = h('div.main', [homeControlBar, h('div.code-editor', [])]);

  const view$ = state$.map(
      (state) => state.runningSimulation ?
          simulationView(state.paused, state.speed) :
          homeView);

  const graphViewContainer$ = dom.select('.graphview').element();
  const graphView$ =
      xs.combine(state$, graphViewContainer$)
          .map(
              ([state, container]) => ({graph: state.currentGraph, container}));

  const codeEditorContainer$ =
      dom.select('div.code-editor').element().map((c: HTMLElement) => c);

  const codeEditor$ =
      xs.combine(codeEditorContainer$).map(([container]) => ({container}));

  return {dom: view$, graphView: graphView$, codeEditor: codeEditor$};
}

// Program

interface Sources {
  dom: MainDOMSource;
  codeEditor: Stream<string>;
}

type Sinks = View;

function main(sources: Sources): Sinks {
  return view(sources.dom, model(intent(sources)));
}

const drivers = {
  dom: makeDOMDriver('#app'),
  graphView: graphView.driver,
  codeEditor: codeEditor.driver
};

run(main, drivers);