import { useState } from 'react'
import { LuaSimulation, SimulationError } from 'simulation'

const useSimulation = (
  code: string,
  onError: (lno: SimulationError) => void
) => {
  const [simulation, setSimulation] = useState(() => new LuaSimulation(code))

  const tick = () => {
    const result = simulation.tick()
    switch (result.type) {
      case 'failed':
        onError(result.error)
        break
      default:
        setSimulation(simulation)
        break
    }
  }

  return { tick, graph: simulation.graph }
}

export default useSimulation
