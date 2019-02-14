import * as React from 'react'
import { useState, ReactElement } from 'react'
import { saveAs } from 'file-saver'
import { Button, Dialog, DialogTitle, DialogActions, TextField, DialogContentText, DialogContent } from '@material-ui/core'

type BlobFunction = () => Blob

export interface ButtonProps {
  onClick: () => void
}

export interface Props<P> {
  contents: string | Blob | BlobFunction
  defaultFilename: string
  label?: string
  button?: (p: ButtonProps) => ReactElement<P>
}

function FileSaver<P>(p: Props<P>) {
  const [isOpen, setOpen] = useState(false)
  const [filename, setFilename] = useState(p.defaultFilename)
  const label = p.label || "Save File"

  const close = () => setOpen(false)
  const open = () => {
    setFilename(p.defaultFilename)
    setOpen(true)
  }

  const getBlob = () => {
    if (typeof p.contents === 'function') {
      return p.contents()
    }

    if (typeof p.contents === 'string') {
      return new Blob([p.contents], { type: 'text/plain;charset=utf-8' })
    }

    return p.contents
  }

  const save = () => saveAs(getBlob(), filename)
  const saveAndClose = () => {
    save()
    close()
  }

  const button = p.button ? p.button({onClick: open}) : (
    <Button onClick={open}>
        {label}
    </Button>
  )

  return (
    <>
      {button}
      <Dialog
        open={isOpen}
        onClose={close}
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
            onChange={(e) => setFilename(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>
            Cancel
          </Button>
          <Button onClick={saveAndClose}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FileSaver
