import * as React from 'react'
import { useRef, ReactElement, ChangeEvent } from 'react'
import { Button } from '@material-ui/core'

const readFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()

  reader.onload = (e: ProgressEvent) => {
    resolve(reader.result as string)
  }

  reader.onabort = () => reject('Aborted')
  reader.onerror = () => reject('Error on reading file')

  reader.readAsText(file)
})

export interface ButtonProps {
  onClick: () => void
}

export interface Props<T> {
  onLoad: (contents: string) => void
  label?: string
  button?: (p: ButtonProps) => ReactElement<T>
}

/** Reads a file as a string and return it through onLoad callback */
function FileLoader<T>(p: Props<T>) {
  const input = useRef<HTMLInputElement>(null)
  const label = p.label || "Open File"

  const open = () => input.current && input.current.click()

  const handleFileSelect = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files && evt.target.files.item(0)
    if(file) {
      readFile(file).then(p.onLoad)
    }
  }

  const button = p.button ? p.button({onClick: open}) : (
    <Button onClick={open}>
        {label}
    </Button>
  )

  return (
    <>
      {button}
      <input type="file" style={{display: "none"}} onChange={handleFileSelect} ref={input}/>
    </>
  )
}

export default FileLoader
