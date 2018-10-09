import { IGraph, Model } from './Model';
import * as fengari from "fengari-web";
import { kbd } from '@cycle/dom';

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

export const lineModel: Model = function* (graph: IGraph) {
  let vertexId = graph.addVertex()
  while (true) {
    let lastId = vertexId
    vertexId = graph.addVertex()
    graph.connectVertices(vertexId, lastId)
    yield graph
  }
}

export const startModel: Model = function* (graph: IGraph) {
  let firstId = graph.addVertex()
  while (true) {
    graph.connectVertices(firstId, graph.addVertex())
    yield graph
  }
}

export const randomWalkModel: Model = function* (graph: IGraph, k: number) {
  let pos = graph.addVertex()
  graph.connectVertices(pos, pos)
  graph.vertices[pos]!.attributes.set('color', 'red')

  while (true) {
    for (let i = 0; i < k; i++) {
      graph.vertices[pos]!.attributes.delete('color')
      const neighbors = graph.vertices[pos]!.neighbors;
      const selection = Math.floor(Math.random() * neighbors.length);
      pos = neighbors[selection];
      graph.vertices[pos]!.attributes.set('color', 'red')
      yield graph
    }
    graph.connectVertices(pos, graph.addVertex())
    yield graph
  }
}

export const lineModelLua =
  `currId = addVertex()
setAttributes(currId, "color", "red")

while true do
  lastId = currId
  currId = addVertex()
  connectVertices(lastId, currId)
  coroutine.yield()
  setAttributes(lastId, "color", "white")
  setAttributes(currId, "color", "red")
  coroutine.yield()
end`

export const simpleRandom =
  `firstId = addVertex()
secondId = addVertex()
setAttributes(firstId, "color", "green")
setAttributes(secondId, "color", "red")
connectVertices(firstId, secondId)
coroutine.yield()

while true do
  id = addVertex()
  if math.random(1,2) == 1 then
    connectVertices(firstId, id)
    setAttributes(id, "color", "green")
  else
    connectVertices(secondId, id)
    setAttributes(id, "color", "red")
  end
  coroutine.yield()
end`

const wrapCode = (code: string) => `
function main()
  ${code}
end
`

export const luaModel: Model = function* (graph: IGraph, code: string) {

  const stdlib : Map<string, (L: any) => number> = new Map()

  stdlib.set('addVertex', (L: any) => {
      lua.lua_pushnumber(L, graph.addVertex() + 1)
      return 1;
  })

  stdlib.set('connectVertices', (L: any) => {
    const pos1 = lua.lua_tonumber(L, 1) - 1;
    const pos2 = lua.lua_tonumber(L, 2) - 1;
    graph.connectVertices(pos1, pos2)
    return 0;
  })

  stdlib.set('setAttributes', (L: any) => {
    const pos = lua.lua_tonumber(L, 1) - 1;
    const key = fengari.to_jsstring(lua.lua_tostring(L, 2));
    const val = fengari.to_jsstring(lua.lua_tostring(L, 3));
    graph.vertices[pos].attributes.set(key, val)
    return 0;
  })

  const L = lauxlib.luaL_newstate()
  lualib.luaL_openlibs(L)

  for (let key of stdlib.keys()){
    lua.lua_pushcfunction(L, stdlib.get(key)!)
    lua.lua_setglobal(L, key)
  }

  lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)))
  lua.lua_pcall(L, 0, 0, 0)
  const L2 = lua.lua_newthread(L)
  lua.lua_getglobal(L2, "main")

  while (true) {
    const resp = lua.lua_resume(L2, null, 0)
    yield graph
    if (resp == 0) break;
  }
}