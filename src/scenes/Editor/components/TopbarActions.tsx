import * as React from 'react'
import FileSaver from 'components/FileSaver'
import FileLoader from 'components/FileLoader'

import ExampleLoader from './ExampleLoader'
import { Button } from '@material-ui/core'

interface Props {
  code: string
  run: () => void
  setCode: (code: string) => void
}

const TopbarActions = (props: Props) => (
  <>
    <Button href="https://github.com/bamorim/rggvis/tree/master/docs/index.md" target="_blank">
      Docs
    </Button>
    <FileSaver
      contents={props.code}
      defaultFilename="script.lua"
      label="Save"
    />
    <FileLoader onLoad={props.setCode} label="Open" />
    <ExampleLoader setCode={props.setCode} />
    <Button onClick={() => props.run()} color="inherit">
      Start
    </Button>
  </>
)

export default TopbarActions
