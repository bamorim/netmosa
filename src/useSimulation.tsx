import { useState } from "react";
import LuaSimulation from "./LuaSimulation";

const useSimulation = (code: string) => {
  const [simulation, setSimulation] = useState(() => {
    const simulation = new LuaSimulation(code)
    return simulation
  })

  const tick = () => {
    simulation.tick()
    // Both simulation and state are mutable, so just it set again to trigger changes.
    setSimulation(simulation)
  }

  return {tick, graph: simulation.graph};
}

export default useSimulation;