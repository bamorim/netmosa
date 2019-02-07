import { useState } from 'react'
import LuaSimulation from 'simulation/LuaSimulation'

const useSimulation = (code: string) => {
  const [simulation, setSimulation] = useState(() => new LuaSimulation(code))

  const tick = () => {
    simulation.tick()
    setSimulation(simulation)
  }

  return { tick, graph: simulation.graph }
}

export default useSimulation
