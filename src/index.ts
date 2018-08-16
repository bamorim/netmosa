import {from} from 'rxjs';

import {Action, Edge, GraphReader, Model} from './Model';
import {Simulation} from './Simulator';


const starModel: Model<number> = (g: GraphReader, _: number): Action => {
  const action: Action = {action: 'addVertex', connectTo: 0};
  return action;
};

const simulation = new Simulation(1, starModel);

from(simulation).subscribe((x: Edge) => console.log(x));