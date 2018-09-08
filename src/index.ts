import { run } from '@cycle/run';
import { div, label, input, hr, h1, makeDOMDriver, VNode, DOMSource } from '@cycle/dom';
import { Stream } from 'xstream';

interface ISources {
    dom: DOMSource;
}

interface ISinks {
    dom: Stream<VNode>;
}

function main(sources: ISources): ISinks {
    const dom = sources.dom;
    const sinks: ISinks = {
        dom: dom.select('.field').events('input')
            .map(ev => (ev.target as HTMLInputElement).value)
            .startWith('')
            .map(name =>
                div('#root', [
                    label('Name:'),
                    input('.field', { attrs: { type: 'text', value: name } }),
                    hr(),
                    h1(name ? `Hello, ${name}!` : 'Hello! Please enter your name...'),
                ])
            )
    };
    return sinks;
}

let drivers = {
    dom: makeDOMDriver('#app')
}

run(main, drivers)