import * as React from 'react'
import { useState, useEffect } from 'react'
import MonacoEditor from 'react-monaco-editor'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import Layout from 'components/Layout'
import { Button, Menu, MenuItem } from '@material-ui/core'

import examples from 'examples'
import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import { SimulationError } from 'simulation'

interface Props {}

const messageFor = (error: SimulationError) => {
  switch (error.type) {
    case 'runtime':
      return 'Runtime Error'
    case 'syntax':
      return error.message || 'Syntax Error'
  }
}

const EditorPage = (props: Props) => {
  const [
    editor,
    setEditor
  ] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const error = useObservable(appState.lastError$, undefined)
  const code = useObservable(appState.code$, '')

  const updateError = () => {
    const model = editor && editor.getModel()

    if (model && error) {
      monaco.editor.setModelMarkers(model, 'test', [
        {
          startLineNumber: error.lineNo,
          startColumn: 1,
          endLineNumber: error.lineNo,
          endColumn: 1000,
          message: messageFor(error),
          severity: monaco.MarkerSeverity.Warning
        }
      ])
    }
  }

  useEffect(updateError, [code, error])

  const editorDidMount = (newEditor: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(newEditor)
    updateError()
  }

  const setCodeAndClose = (newCode: string) => {
    appState.setCode(newCode)
    setMenuAnchor(null)
  }

  return (
    <Layout
      actions={
        <>
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
          <Button onClick={() => appState.run()} color="inherit">
            Start
          </Button>
        </>
      }
    >
      <MonacoEditor
        language="lua"
        theme="vs-light"
        value={code}
        onChange={(newCode: string) => appState.setCode(newCode)}
        editorDidMount={editorDidMount}
        options={{
          minimap: { enabled: false },
          automaticLayout: true
        }}
      />
    </Layout>
  )
}

export default EditorPage
