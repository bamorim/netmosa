
import {Action, GraphReader, Model, Vertex} from './Model';

export const lineModel: Model<{}> = (g: GraphReader, _: {}): Action => {
  const action: Action = {action: 'addVertex', connectTo: g.vertexCount-1};
  return action;
};

export const starModel: Model<{}> = (g: GraphReader, _: {}): Action => {
  const action: Action = {action: 'addVertex', connectTo: 0};
  return action;
};

interface RandomWalkState {
  pos: Vertex;
}

// This is the model with the self-lopp
export const randomWalkModel: (_: number) => Model<RandomWalkState> =
    (k: number) => (g: GraphReader, state: RandomWalkState): Action => {
      for (let i = 0; i < k; i++) {
        const neighbors = g.neighborsOf(state.pos);
        const possibleNextStates =
            state.pos === 0 ? neighbors.concat([0]) : neighbors;
        const selection = Math.floor(Math.random() * possibleNextStates.length);
        state.pos = possibleNextStates[selection];
      }

      return {action: 'addVertex', connectTo: state.pos};
    };