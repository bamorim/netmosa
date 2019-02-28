import * as React from 'react'
import { useState, useEffect } from 'react'
import MonacoEditor from 'react-monaco-editor'
import * as monaco from 'monaco-editor'
import Layout from 'components/Layout'

import { appState } from 'appState'
import useObservable from 'hooks/useObservable'
import { SimulationError } from 'simulation'
import TopbarActions from './components/TopbarActions'

interface Props {}

const messageFor = (error: SimulationError) => {
  switch (error.type) {
    case 'runtime':
      return 'Runtime Error'
    case 'syntax':
      return error.message || 'Syntax Error'
  }
}

const Editor = (props: Props) => {
  const [
    editor,
    setEditor
  ] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)
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

  return (
    <Layout
      actions={
        <TopbarActions
          code={code}
          setCode={appState.setCode}
          run={appState.run}
        />
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

export default Editor
