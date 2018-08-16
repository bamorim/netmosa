import {from} from 'rxjs';
import {take} from 'rxjs/operators';
import {Edge} from './Model';
import {randomWalkModel} from './Models';
import {Simulation} from './Simulator';

const k = 2;
const n = 100;

const simulation = new Simulation({pos: 0}, randomWalkModel(k));

// Render as dot
console.log('digraph G {');
console.log('0 -> 0');
from(simulation)
    .pipe(take(n))
    .subscribe((x: Edge) => console.log('' + x[0] + ' -> ' + x[1]));
console.log('}');