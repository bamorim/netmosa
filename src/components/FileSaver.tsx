import * as React from 'react'
import { useState, ReactElement } from 'react'
import { Button } from '@material-ui/core'

import FileSaveDialog from './FileSaveDialog'

type BlobFunction = () => Blob

export interface ButtonProps {
  onClick: () => void
}

export interface Props<T> {
  contents: string | Blob | BlobFunction
  defaultFilename: string
  label?: string
  button?: (p: ButtonProps) => ReactElement<T>
}

function FileSaver<T>(p: Props<T>) {
  const [isOpen, setOpen] = useState(false)
  const label = p.label || 'Save File'

  const onClose = () => setOpen(false)
  const open = () => setOpen(true)

  const button = p.button ? (
    p.button({ onClick: open })
  ) : (
    <Button color="inherit" onClick={open}>
      {label}
    </Button>
  )

  return (
    <>
      {button}
      <FileSaveDialog
        open={isOpen}
        onClose={onClose}
        defaultFilename={p.defaultFilename}
        contents={p.contents}
      />
    </>
  )
}

export default FileSaver
