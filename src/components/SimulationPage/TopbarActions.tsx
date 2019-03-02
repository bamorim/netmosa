import * as React from 'react'
import { useState } from 'react'
import {
  createStyles,
  withStyles,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar
} from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import MoreIcon from '@material-ui/icons/MoreVert'

import FileSaveDialog from 'components/FileSaveDialog'

const styles = createStyles({
  chip: {
    margin: '5px'
  },
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
  },
  formControl: {}
})

interface Props {
  autozoomEnabled: boolean
  classes: Record<keyof typeof styles, string>
  edgeCount: number
  generateGraphML: () => Blob
  pause: () => void
  paused: boolean
  play: () => void
  setAutozoomEnabled: (enabled: boolean) => void
  setSpeed: (speed: number) => void
  speed: number
  stop: () => void
  vertexCount: number
}

const TopbarActions = (props: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const toggleAutozoom = () => {
    setMenuAnchor(null)
    props.setAutozoomEnabled(!props.autozoomEnabled)
  }

  const openSaveDialog = () => {
    setMenuAnchor(null)
    setSaveDialogOpen(true)
  }

  const closeSaveDialog = () => setSaveDialogOpen(false)

  return (
    <>
      <Chip
        variant="outlined"
        className={props.classes.chip}
        avatar={<Avatar>{props.vertexCount}</Avatar>}
        label="Vertices"
      />
      <Chip
        variant="outlined"
        className={props.classes.chip}
        avatar={<Avatar>{props.edgeCount}</Avatar>}
        label="Edges"
      />

      <FormControl className={props.classes.formControl}>
        <InputLabel htmlFor="age-native-simple">Speed</InputLabel>
        <Select
          value={props.speed}
          onChange={e => props.setSpeed(parseInt(e.target.value, 10))}
        >
          <MenuItem value={1}>1X</MenuItem>
          <MenuItem value={2}>2X</MenuItem>
          <MenuItem value={4}>4X</MenuItem>
          <MenuItem value={8}>8X</MenuItem>
          <MenuItem value={16}>16X</MenuItem>
          <MenuItem value={32}>32X</MenuItem>
        </Select>
      </FormControl>
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
      <IconButton
        onClick={({ currentTarget }) => setMenuAnchor(currentTarget)}
        color="inherit"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => toggleAutozoom()}>
          {props.autozoomEnabled ? 'Disable' : 'Enable'} Autozoom
        </MenuItem>
        <MenuItem onClick={() => openSaveDialog()}>Export Graph</MenuItem>
      </Menu>
      <FileSaveDialog
        open={saveDialogOpen}
        onClose={closeSaveDialog}
        defaultFilename={'graph.graphml'}
        contents={props.generateGraphML}
      />
    </>
  )
}

export default withStyles(styles)(TopbarActions)
