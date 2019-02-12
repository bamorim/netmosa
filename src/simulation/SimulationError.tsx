export interface RuntimeError {
  type: 'runtime'
  lineNo: number
}

export interface SyntaxError {
  type: 'syntax'
}

export type SimulationError = RuntimeError | SyntaxError
