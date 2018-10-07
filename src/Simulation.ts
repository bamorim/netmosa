import { Model, IGraph, Graph } from "./Model";
import xs, { Stream, Listener } from "xstream";
import { adapt } from "@cycle/run/lib/adapt";

export interface StartSimulationAction {
  action: 'StartSimulation',
  model: Model,
  args: any[]
}

export interface TickAction {
  action: 'Tick'
}

export const tick : TickAction = {action: 'Tick'}
export const startSimulation = (model: Model, args: any[]) : Action => ({
  action: 'StartSimulation',
  model: model,
  args: args
})

export type Action = TickAction | StartSimulationAction

export function simulationDriver(input$: Stream<Action>) {
  let runningModel : IterableIterator<IGraph> | null;
  let inputListener: Partial<Listener<Action>> | null = null;

  return adapt(xs.create({
    start: function(listener: Listener<IGraph>) {
      inputListener = {
        next: (received : Action) => {
          switch (received.action) {
            case 'StartSimulation':
              runningModel = received.model(new Graph(), received.args)
              listener.next(runningModel.next().value)
              break;
            case 'Tick':
              if(runningModel) listener.next(runningModel.next().value)
              break;
          }
        }
      }
      input$.addListener(inputListener)
    },
    stop: () => {
      if (inputListener != null) input$.removeListener(inputListener)
    }
  }))
}