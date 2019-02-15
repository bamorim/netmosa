export const pdf = (distribution: number[]): number[] => {
  const total = distribution.reduce((a, b) => a + b, 0)
  return distribution.map(x => x / total)
}
export const cdf = (distribution: number[]): number[] => {
  const result: number[] = []
  pdf(distribution).forEach(x =>
    result.push((result[result.length - 1] || 0) + x)
  )
  return result
}

export const ccdf = (distribution: number[]): number[] =>
  cdf(distribution).map(x => 1 - x)
