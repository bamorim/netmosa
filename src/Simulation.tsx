import { ReadGraph } from "graph"

export default interface Simulation {
  readonly graph: ReadGraph
  tick: () => void
}
