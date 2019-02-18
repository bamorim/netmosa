import * as fengari from 'fengari-web'

import { Graph } from '../graph'
import { openStdLib } from './stdlib'
import { SimulationError } from './SimulationError'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

const prefix = `
function render()
  coroutine.yield()
end

function main()
`.trim()

const sufix = 'end'

const wrapCode = (code: string) => [prefix, code, sufix].join('\n')

const runtimeError = (lineNo: number): SimulationError => ({
  type: 'runtime',
  lineNo
})

const syntaxError = (lineNo: number, message?: string): SimulationError => ({
  type: 'syntax',
  lineNo,
  message
})

export default function* luaSimulation(
  code: string,
  graph: Graph
): IterableIterator<void | SimulationError> {
  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)
  openStdLib(L, graph)

  if (lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)))) {
    // Syntax Error

    const regex = /^\[[^\]]*\]:(\d+): (.*)$/
    const error = fengari.to_jsstring(lua.lua_tostring(L, 1))
    const matches = error.match(regex)
    if (matches && matches.length === 3) {
      const lineNo = parseInt(matches[1], 10) - prefix.split('\n').length
      const message = matches[2]
      return syntaxError(lineNo, message)
    }

    return syntaxError(0)
  }

  if (lua.lua_pcall(L, 0, 0, 0)) {
    // Some strange uncaught error
    return runtimeError(0)
  }
  const L2 = lua.lua_newthread(L)
  lua.lua_getglobal(L2, 'main')

  while (true) {
    try {
      const resp = lua.lua_resume(L2, null, 0)
      yield
      if (resp === 0) {
        break
      }
    } catch (e) {
      const debug = new lua.lua_Debug()
      if (lua.lua_getstack(L2, 0, debug) > 0) {
        lua.lua_getinfo(L2, fengari.to_luastring('Slnt', true), debug)
        const lineNo = debug.currentline - prefix.split('\n').length
        return runtimeError(lineNo)
      } else {
        // Stack depth is 0 on thread L2, it's an uncaught error
        return runtimeError(0)
      }
    }
  }

  return
}
