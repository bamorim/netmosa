import * as React from 'react'
import { useState } from 'react'
import { FormControlLabel, Radio, RadioGroup, Paper, FormControl, FormLabel, createStyles, withStyles } from '@material-ui/core';
import {
  Axis,
  Chart,
  Line,
  LinearScale,
  PointScale,
  Group,
  Dimension,
  LogScale,
} from '@chart-parts/react'
import { AxisOrientation } from '@chart-parts/interfaces'
import { Renderer } from '@chart-parts/react-svg-renderer'



type Transformation = 'pdf' | 'cdf' | 'ccdf'

const styles = createStyles({
  radioGroup: {
    flexDirection: "row"
  }
})

export interface Props {
  distribution: number[],
  classes: Record<keyof typeof styles, string>
}

const renderer = new Renderer()

const DistributionChart = ({ distribution, classes }: Props) => {
  const [transformation, setTransformation] = useState<Transformation>('ccdf');
  const [xLog, setXLog] = useState(false);
  const [yLog, setYLog] = useState(false);
  return (
    <div>
      <Chart
        width={500}
        height={200}
        padding={5}
        renderer={renderer}
        data={{ data: toDataPoints(distribution, transformation, xLog, yLog) }}
      >
        <PointScale
          name="x"
          stepName="xStep"
          domain="data.x"
          range={Dimension.Width}
        />
        <LogScale
          name="y"
          domain="data.y"
          range={Dimension.Height}
        />
        <Axis orient={AxisOrientation.Bottom} scale="x" />
        <Axis orient={AxisOrientation.Left} scale="y" />

        <Group table="data">
          <Line
            table="data"
            x={({ d, x }) => x(d.x)}
            y={({ d, y }) => y(d.y)}
            stroke="black"
            strokeWidth={1}
          />
        </Group>
      </Chart>
      <Paper>
        <FormControl>
          <FormLabel>Transformation</FormLabel>
          <RadioGroup
            aria-label="Transformation"
            name="transformation"
            value={transformation}
            classes={{root: classes.radioGroup}}
            onChange={(e, val) => setTransformation(val as Transformation)}
          >
            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
            <FormControlLabel value="cdf" control={<Radio />} label="CDF" />
            <FormControlLabel value="ccdf" control={<Radio />} label="CCDF" />
          </RadioGroup>

          <FormLabel>X Scale</FormLabel>
          <RadioGroup
            aria-label="Transformation"
            name="transformation"
            value={xLog ? "log" : "linear"}
            classes={{root: classes.radioGroup}}
            onChange={(e, val) => setXLog(val === "log")}
          >
            <FormControlLabel value="linear" control={<Radio />} label="Linear" />
            <FormControlLabel value="log" control={<Radio />} label="Log" />
          </RadioGroup>

          <FormLabel>Y Scale</FormLabel>
          <RadioGroup
            aria-label="Transformation"
            name="transformation"
            value={yLog ? "log" : "linear"}
            classes={{root: classes.radioGroup}}
            onChange={(e, val) => setYLog(val === "log")}
          >
            <FormControlLabel value="linear" control={<Radio />} label="Linear" />
            <FormControlLabel value="log" control={<Radio />} label="Log" />
          </RadioGroup>
        </FormControl>
      </Paper>
    </div>
  )
}

export default withStyles(styles)(DistributionChart)

const toDataPoints = (distribution: number[], transformation: Transformation, xLog: boolean, yLog: boolean) => (
  transform(distribution, transformation)
  .map((v, i) => ({ x: i, y: v || 0 }))
)

interface DataPoint {
  x: number,
  y: number
}

const applyLog = (xLog: boolean, yLog: boolean) => ({x, y}: DataPoint): DataPoint => ({
  x: xLog ? Math.log10(x) : x,
  y: yLog ? Math.log10(y) : y
})

const filterLog = (xLog: boolean, yLog: boolean) => ({x, y}: DataPoint): boolean => (!xLog || x > 0) && (!yLog || y > 0)

const transform = (distribution: number[], transformation: Transformation) => {
  switch(transformation) {
    case 'pdf':
      return pdf(distribution)
    case 'cdf':
      return cdf(distribution)
    default:
      return ccdf(distribution)
  }
}

const pdf = (distribution: number[]): number[] => {
  let total = distribution.reduce((a, b) => a + b, 0);
  return distribution.map((x) => x/total);
}
const cdf = (distribution: number[]): number[] => {
  let result: number[] = [];
  pdf(distribution).forEach((x) => result.push((result[result.length-1] || 0) + x))
  return result
}

const ccdf = (distribution: number[]): number[] => cdf(distribution).map((x) => 1-x)