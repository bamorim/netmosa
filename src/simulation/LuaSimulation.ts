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

export default function* luaSimulation(
  code: string,
  graph: Graph
): IterableIterator<void | SimulationError> {
  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)
  openStdLib(L, graph)

  lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)))
  lua.lua_pcall(L, 0, 0, 0)
  const L2 = lua.lua_newthread(L)
  lua.lua_getglobal(L2, 'main')

  while (true) {
    try {
      const resp = lua.lua_resume(L2, null, 0)
      yield
      if (resp === 0) {
        break
      }
    } catch {
      const debug = new lua.lua_Debug()
      lua.lua_getstack(L2, 0, debug)
      lua.lua_getinfo(L2, fengari.to_luastring('Slnt', true), debug)
      const lineNo = debug.currentline - prefix.split('\n').length
      return runtimeError(lineNo)
    }
  }

  return
}
