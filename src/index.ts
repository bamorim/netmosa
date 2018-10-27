import { h, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom';
import { run } from '@cycle/run';
import { Stream } from 'xstream';
import xs from 'xstream';

import * as codeEditor from './CodeEditor';
import * as graphView from './GraphView';
import { AdjacencyListGraph, ReadGraph, Model } from './Model';
import { luaModel } from './LuaModel';
import Visualization, { State } from "./Visualization";

interface AppState {
    script: string;
    runningModel?: Model
}

interface Start { type: "Start" }
interface Stop { type: "Stop"; }

interface ChangeScript {
  type: "ChangeScript";
  script: string;
}

type Action = Start | Stop | ChangeScript;

function model(action$: Stream<Action>): Stream<AppState> {
    const script$ = action$
        .filter((a) => a.type == "ChangeScript")
        .map(({script}: ChangeScript) => script)
        .startWith('')

    const start$ = action$.filter((a) => a.type == "Start")

    const notRunningModel$ = action$.filter((a) => a.type == "Stop").mapTo(undefined)
    const runningModel$ = xs.combine(script$, start$).map(([script, _]) => luaModel(script))
    const maybeRunningModel$ = xs.merge(runningModel$, notRunningModel$).startWith(undefined)

    return xs
        .combine(maybeRunningModel$, script$)
        .map<AppState>(([runningModel, script]) => ({runningModel, script}))
}

// View

function view(state$: Stream<AppState>, visView$: Stream<VNode>): Stream<VNode> {
    const homeControlBar =
        h('div.home-control-bar', [h('button.ui.icon.labeled.button.intent-start',
            [h('i.play.icon'), 'Start'])]);

    const homeView = h('div.vlayout', [homeControlBar, h('div.code-editor', [])]);

    return state$.map((state) => state.runningModel ? visView$ : xs.of(homeView)).flatten()
}

// Intent

function intent({ DOM, codeEditor }: Sources): Stream<Action> {
    const changeSpeed$ = codeEditor
        .map<ChangeScript>((script) => ({type: "ChangeScript", script}))

    const start$ = DOM.select('.intent-start').events('click').mapTo<Start>({type: "Start"})
    const stop$ = DOM.select('.intent-stop').events('click').mapTo<Stop>({type: "Stop"})

    return xs.merge(changeSpeed$, start$, stop$)
}

// Program

interface Sources {
    DOM: MainDOMSource;
    codeEditor: Stream<string>;
}

interface Sinks {
    DOM: Stream<VNode>;
    graphView: graphView.Input;
    codeEditor: codeEditor.Input;
}

function main(sources: Sources): Sinks {
    const action$ = intent(sources);
    const state$ = model(action$);

    const visSources = {
        DOM: sources.DOM,
        props$: state$
            .filter(({runningModel}) => runningModel !== undefined)
            .map(({runningModel}) => ({model: runningModel!}))
    }

    const vis = Visualization(visSources)

    const view$ = view(state$, vis.DOM)

    const codeEditorContainer$ =
        sources.DOM.select('div.code-editor').element().map((c: HTMLElement) => c);
    const codeEditor$ =
        xs.combine(codeEditorContainer$).map(([container]) => ({ container }));


    const graphView$ =
    xs.combine(vis.state$, vis.graphViewContainer$)
        .map(
            ([{graph}, container]) => ({ graph, container }));

    return {
        DOM: view$,
        graphView: graphView$,
        codeEditor: codeEditor$
    };
}

const drivers = {
    DOM: makeDOMDriver('#app'),
    graphView: graphView.driver,
    codeEditor: codeEditor.driver
};

run(main, drivers);