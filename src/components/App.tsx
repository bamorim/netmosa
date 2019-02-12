import * as React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import EditorPage from 'components/EditorPage'
import VisualizationPage from 'components/VisualizationPage'
import useObservable from 'hooks/useObservable'
import { appState } from 'appState'

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
  const runningSimulation = useObservable(
    appState.runningSimulation$,
    undefined
  )

  return (
    <MuiThemeProvider theme={theme}>
      {runningSimulation ? (
        <VisualizationPage runningSimulation={runningSimulation} />
      ) : (
        <EditorPage />
      )}
    </MuiThemeProvider>
  )
}
export default App
