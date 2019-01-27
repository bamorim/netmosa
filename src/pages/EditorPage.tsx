import * as React from 'react'
import { useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import Layout from 'Layout'
import { Button, Menu, MenuItem } from '@material-ui/core'

import examples from 'examples'

interface Props {
  code: string
  setCode: (code: string) => void
  start: () => void
}

const EditorPage = ({ code, setCode, start }: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const setCodeAndClose = (newCode: string) => {
    setCode(newCode)
    setMenuAnchor(null)
  }

  return (
    <Layout
      actions={
        <div>
          <Button onClick={({ currentTarget }) => setMenuAnchor(currentTarget)}>
            Load Example
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={menuAnchor !== null}
            onClose={() => setMenuAnchor(null)}
          >
            {examples.map((example, i) => (
              <MenuItem
                key={i}
                onClick={() => example.load().then(setCodeAndClose)}
              >
                {example.name}
              </MenuItem>
            ))}
          </Menu>
          <Button onClick={start} color="inherit">
            Start
          </Button>
        </div>
      }
    >
      <MonacoEditor
        language="lua"
        theme="vs-light"
        value={code}
        onChange={setCode}
        options={{
          minimap: { enabled: false },
          automaticLayout: true
        }}
      />
    </Layout>
  )
}

export default EditorPage
