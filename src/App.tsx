import * as React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import Router from 'Router'

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

const App = () => (
  <MuiThemeProvider theme={theme}>
    <Router />
  </MuiThemeProvider>
)
export default App
