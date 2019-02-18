import * as React from 'react'
import { createStyles, withStyles, IconButton } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'

const styles = createStyles({
  sliderWrapper: {
    width: 150,
    padding: '0 10px',
    display: 'inline-flex'
  },
  track: {
    background: '#ffffff'
  },
  thumb: {
    background: '#999999'
  }
})

interface Props {
  speed: number
  setSpeed: (speed: number) => void
  paused: boolean
  play: () => void
  pause: () => void
  stop: () => void
  classes: Record<keyof typeof styles, string>
}

const TopbarActions = (props: Props) => (
  <>
    <div className={props.classes.sliderWrapper}>
      <Slider
        classes={{ track: props.classes.track, thumb: props.classes.thumb }}
        value={props.speed}
        onChange={(e, v) => props.setSpeed(v)}
      />
    </div>
    {props.paused ? (
      <IconButton onClick={() => props.play()} color="inherit">
        <PlayIcon />
      </IconButton>
    ) : (
      <IconButton onClick={() => props.pause()} color="inherit">
        <PauseIcon />
      </IconButton>
    )}
    <IconButton onClick={props.stop} color="inherit">
      <StopIcon />
    </IconButton>
  </>
)

export default withStyles(styles)(TopbarActions)