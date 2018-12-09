import * as fengari from "fengari-web"

import { Graph, AdjacencyListGraph } from "graph"
import { openStdLib } from "./stdlib"
import Simulation from "Simulation"

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

const wrapCode = (code: string) => `
function render()
  coroutine.yield()
end

function main()
  ${code}
end
`

function* run(code: string, graph: Graph) {
  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)
  openStdLib(L, graph)

  lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)))
  lua.lua_pcall(L, 0, 0, 0)
  const L2 = lua.lua_newthread(L)
  lua.lua_getglobal(L2, "main")

  while (true) {
    const resp = lua.lua_resume(L2, null, 0)
    yield
    if (resp === 0) {
      break
    }
  }
}

export default class LuaSimulation implements Simulation {
  public graph: Graph
  public iterator: IterableIterator<undefined>

  constructor(code: string) {
    this.graph = new AdjacencyListGraph()
    this.iterator = run(code, this.graph)
  }

  public tick() {
    this.iterator.next()
  }
}
