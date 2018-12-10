import * as React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import Router from 'Router'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#212121',
      light: '#484848',
      dark: '#000000'
    },
    secondary: {
      main: '#006064',
      light: '#428e92',
      dark: '#00363a'
    }
  }
})

const App = () => (
  <MuiThemeProvider theme={theme}>
    <Router />
  </MuiThemeProvider>
)
export default App
