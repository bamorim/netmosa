import { SimulationError } from './SimulationError'

export interface Ticked {
  type: 'ticked'
}

export interface Ended {
  type: 'ended'
}

export interface Failed {
  type: 'failed'
  error: SimulationError
}

export type TickResult = Ticked | Ended | Failed
