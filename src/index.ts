import { run } from '@cycle/run';
import { div, label, input, hr, h1, makeDOMDriver, VNode, MainDOMSource } from '@cycle/dom';
import { Stream } from 'xstream';


import { Edge } from './Model';
import { randomWalkModel } from './Models';
import { Simulation } from './Simulator';


import * as d3 from "d3";
import { max } from 'd3';

interface Sources {
    dom: MainDOMSource;
}

interface Sinks {
    dom: Stream<VNode>;
}

function main(sources: Sources): Sinks {
    const dom = sources.dom;
    const sinks: Sinks = {
        dom: dom.select('.field').events('input')
            .map((ev: Event) => (ev.target as HTMLInputElement).value)
            .startWith('')
            .map((name: string) =>
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

const drivers = {
    dom: makeDOMDriver('#app')
};

run(main, drivers);

const simulation = new Simulation({ pos: 0 }, randomWalkModel(2));

// d3 here

interface Node {
    id: string
}

interface Link {
    source: string,
    target: string,
    id: string
}

let nodes: Array<Node> = []

let links: Array<Link> = []


for (let i = 0; i < 20; i++) {
    let { value } = simulation.next();
    addLink(value);
}

function addLink(value: Edge) {
    const nodeMax = max(value) || 0;
    const fromId = value[0].toString();
    const toId = value[1].toString();

    const existingNode = nodes[value[0]] || nodes[value[1]] || {};

    while (nodes.length <= nodeMax) {
        let newNode = Object.assign({}, existingNode, { id: nodes.length.toString() })
        nodes.push(newNode)
    }

    links.push({ source: fromId, target: toId, id: links.length.toString() })
}

console.log(links);
console.log(nodes);

function run_d3() {
    const width = 600
    const height = 300
    const force = d3
        .forceSimulation()
        .nodes(nodes)
        .force('charge', d3.forceManyBody().strength(-150))
        .force('link', d3.forceLink(links).id((d: any) => d.id))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3
        .select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    let link: d3.Selection<d3.BaseType, Link, d3.BaseType, {}> = svg
        .append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link");

    let node: d3.Selection<SVGCircleElement, Node, d3.BaseType, {}> = svg
        .append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

    function ticked() {
        link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);

        node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    }

    function dragstarted(this: SVGCircleElement, d: any) {
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(this: SVGCircleElement, d: any) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(this: SVGCircleElement, d: any) {
        d.fx = null;
        d.fy = null;
    }

    function render() {
        link = link.data(links);
        link.exit().remove();
        link = link.enter().append("line").merge(link);

        node = node.data(nodes);
        node.exit().remove();
        node = node
            .enter()
            .append<SVGCircleElement>("circle")
            .attr("r", 8)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .merge(node);

        force
            .nodes(nodes)
            .on('tick', ticked);

        force.force('link', d3.forceLink(links));
        force.restart();
    }

    setTimeout(() => {
        for (let i = 0; i < 20; i++) {
            let { value } = simulation.next();
            addLink(value);
        }

        render();
    }, 2000)
    render();
}

setTimeout(run_d3, 1000);