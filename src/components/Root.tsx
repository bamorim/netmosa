import * as React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import Editor from 'scenes/Editor'
import Simulation from 'scenes/Simulation'
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

const Root = () => {
  const runningSimulation = useObservable(
    appState.runningSimulation$,
    undefined
  )

  return (
    <MuiThemeProvider theme={theme}>
      {runningSimulation ? (
        <Simulation runningSimulation={runningSimulation} />
      ) : (
        <Editor />
      )}
    </MuiThemeProvider>
  )
}
export default Root
