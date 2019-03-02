export interface RuntimeError {
  type: 'runtime'
  lineNo: number
}

export interface SyntaxError {
  type: 'syntax'
  lineNo: number
  message?: string
}

type SimulationError = RuntimeError | SyntaxError
export default SimulationError
