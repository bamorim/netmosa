import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Root from 'components/Root'
import 'index.scss'
import * as serviceWorker from './serviceWorker'
import AppState from 'model/AppState'

const appState = new AppState()
ReactDOM.render(<Root appState={appState} />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
