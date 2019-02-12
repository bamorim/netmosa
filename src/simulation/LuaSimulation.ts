import * as fengari from 'fengari-web'

import { Graph, AdjacencyListGraph } from '../graph'
import { openStdLib } from './stdlib'
import { TickResult } from './TickResult'

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

const ended = (): TickResult => ({
  type: 'ended'
})

const ticked = (): TickResult => ({
  type: 'ticked'
})

const runtimeError = (lineNo: number): TickResult => ({
  type: 'failed',
  error: { type: 'runtime', lineNo }
})

function* run(code: string, graph: Graph): IterableIterator<TickResult> {
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
      yield ticked()
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

  return ended()
}

export default class LuaSimulation {
  public graph: Graph
  public iterator: IterableIterator<TickResult>
  private lastResult: IteratorResult<TickResult> | null

  constructor(code: string) {
    this.graph = new AdjacencyListGraph()
    this.iterator = run(code, this.graph)
  }

  public tick(): TickResult {
    if (!this.lastResult || !this.lastResult.done) {
      this.lastResult = this.iterator.next()
    }
    return this.lastResult.value
  }
}
