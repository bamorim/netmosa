import * as React from 'react'

interface SNProps {
  value: number
}

export const trimmedExponential = (n: number) => {
  const [mantissa, exponent] = n.toExponential().split('e')
  return `${mantissa.substring(0, 4)}e${exponent}`
}

const ScientificNotation = ({ value }: SNProps) => {
  const [mantissa, exponent] = trimmedExponential(value).split('e')
  const normalExponent =
    exponent.substring(0, 1) === '+' ? exponent.substring(1) : exponent
  return (
    <>
      {mantissa} 10<sup>{normalExponent}</sup>
    </>
  )
}

export default ScientificNotation
