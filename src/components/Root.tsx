import * as React from 'react'
import { createMuiTheme, MuiThemeProvider, colors } from '@material-ui/core'
import EditorPage from './EditorPage'
import SimulationPage from './SimulationPage'
import useObservable from 'hooks/useObservable'
import AppState from 'model/AppState'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: 'light',
    primary: colors.grey,
    secondary: colors.lightBlue
  }
})

interface Props {
  appState: AppState
}

const Root = ({ appState }: Props) => {
  const simulationState = useObservable(appState.simulationState$, undefined)

  return (
    <MuiThemeProvider theme={theme}>
      {simulationState ? (
        <SimulationPage
          stop={appState.stop}
          simulationState={simulationState}
        />
      ) : (
        <EditorPage appState={appState} />
      )}
    </MuiThemeProvider>
  )
}
export default Root
