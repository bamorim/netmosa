import * as React from 'react'
import { useState, useEffect } from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import EditorPage from 'components/EditorPage'
import VisualizationPage from 'components/VisualizationPage'
import tutorial from 'examples/tutorial.lua'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: '#e0e0e0'
    },
    secondary: {
      main: '#616161'
    }
  }
})

const App = () => {
  const [code, setCode] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetch(tutorial).then(r => r.text()).then(setCode)
  }, [])

  return (
    <MuiThemeProvider theme={theme}>
      {
        running ?
        <VisualizationPage code={code} stop={() => setRunning(false)} /> :
        <EditorPage
        code={code}
        setCode={setCode}
        start={() => setRunning(true)}
      />
      }
    </MuiThemeProvider>
  )
}
export default App
