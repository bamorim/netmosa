export interface RuntimeError {
  type: 'runtime'
  lineNo: number
}

export interface SyntaxError {
  type: 'syntax'
  lineNo: number
  message?: string
}

export type SimulationError = RuntimeError | SyntaxError
