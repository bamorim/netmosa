import { ChartConfig, Datum, Transformation } from './types'

const distToData = (config: ChartConfig, distribution: number[]): Datum[] => {
  let data = transform(distribution, config.transformation).map((v, i) => ({
    x: i,
    y: v || 0
  }))

  if (config.xLog) {
    console.log(data)
    data = applyLog('x', data)
    console.log(data)
  }

  if (config.yLog) {
    data = applyLog('y', data)
  }

  return data
}

export default distToData

const applyLog = (selector: keyof Datum, data: Datum[]): Datum[] =>
  data
    .filter(datum => datum[selector] > 0)
    .map(datum => ({ ...datum, [selector]: Math.log(datum[selector]) }))

const transform = (distribution: number[], transformation: Transformation) => {
  switch (transformation) {
    case 'pdf':
      return pdf(distribution)
    case 'cdf':
      return cdf(distribution)
    default:
      return ccdf(distribution)
  }
}

const pdf = (distribution: number[]): number[] => {
  let total = distribution.reduce((a, b) => a + b, 0)
  return distribution.map(x => x / total)
}
const cdf = (distribution: number[]): number[] => {
  let result: number[] = []
  pdf(distribution).forEach(x =>
    result.push((result[result.length - 1] || 0) + x)
  )
  return result
}

const ccdf = (distribution: number[]): number[] =>
  cdf(distribution).map(x => 1 - x)
