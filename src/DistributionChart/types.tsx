export type Transformation = 'pdf' | 'cdf' | 'ccdf'

export interface ChartConfig {
  transformation: Transformation,
  xLog: boolean,
  yLog: boolean
}

export interface Datum {
  x: number,
  y: number
}