import * as React from 'react'
import {min, max, mean, median, reduce} from 'ramda'

interface Props {
  distribution: number[]
}

// TODO: The problem here is the format of the distribution
const Statistics = ({distribution}: Props) => (
  <div>
    Min: {reduce(min, +Infinity, distribution)}<br/>
    Max: {reduce(max, -Infinity, distribution)}<br/>
    Mean: {mean(distribution)}<br/>
    Median: {median(distribution)}
  </div>
)

export default Statistics