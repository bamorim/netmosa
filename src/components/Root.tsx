import * as React from 'react'
import { createMuiTheme, MuiThemeProvider, colors } from '@material-ui/core'
import Editor from 'scenes/Editor'
import Simulation from 'scenes/Simulation'
import useObservable from 'hooks/useObservable'
import { appState } from 'appState'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: 'light',
    primary: colors.grey,
    secondary: colors.blueGrey
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
        <Simulation simulation={runningSimulation} />
      ) : (
        <Editor />
      )}
    </MuiThemeProvider>
  )
}
export default Root
