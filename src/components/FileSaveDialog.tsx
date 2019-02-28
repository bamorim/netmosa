import * as React from 'react'
import { useState } from 'react'
import { saveAs } from 'file-saver'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  DialogContentText,
  DialogContent
} from '@material-ui/core'

type BlobFunction = () => Blob

export interface ButtonProps {
  onClick: () => void
}

export interface Props<T> {
  contents: string | Blob | BlobFunction
  defaultFilename: string
  open: boolean
  onClose: () => void
}

function FileSaveDialog<T>(props: Props<T>) {
  const [filename, setFilename] = useState(props.defaultFilename)

  const getBlob = () => {
    if (typeof props.contents === 'function') {
      return props.contents()
    }

    if (typeof props.contents === 'string') {
      return new Blob([props.contents], { type: 'text/plain;charset=utf-8' })
    }

    return props.contents
  }

  const save = () => saveAs(getBlob(), filename)
  const saveAndClose = () => {
    save()
    props.onClose()
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Save File</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Set the filename of the file to download it.
        </DialogContentText>
        <TextField
          autoFocus={true}
          margin="dense"
          id="filename"
          label="Filename"
          fullWidth={true}
          value={filename}
          onChange={e => setFilename(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button onClick={saveAndClose}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default FileSaveDialog
