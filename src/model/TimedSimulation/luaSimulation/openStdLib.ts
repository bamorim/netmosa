import * as fengari from 'fengari-web'
import Graph from 'model/Graph'
import { VertexId, Edge, EdgeId } from 'model/types'

const lua = fengari.lua

type StdLibFunction = (graph: Graph) => (L: {}) => number

export interface StdLibEntry {
  fn: StdLibFunction
  name: string
}

const stdlib: StdLibEntry[] = []

const openStdLib = (L: {}, graph: Graph) => {
  for (const func of stdlib) {
    lua.lua_pushcfunction(L, func.fn(graph))
    lua.lua_setglobal(L, func.name)
  }
}

export default openStdLib

const define = (name: string, fn: StdLibFunction) => {
  stdlib.push({ name, fn })
}

define('addVertex', (graph: Graph) => (L: {}) => {
  const vertexId = graph.addVertex()

  return returnIndex(L, vertexId)
})

define('connectVertices', (graph: Graph) => (L: {}) => {
  const id1 = lua.lua_tonumber(L, 1) - 1
  const id2 = lua.lua_tonumber(L, 2) - 1

  const edgeId = graph.connectVertices(id1, id2)

  return returnIndex(L, edgeId)
})

define('setAttributes', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1
  const key = fengari.to_jsstring(lua.lua_tostring(L, 2))
  const val = fengari.to_jsstring(lua.lua_tostring(L, 3))

  const resp = graph.setAttribute(id, key, val)

  lua.lua_pushboolean(L, resp)
  return 1
})

define('getAttributes', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1
  const key = fengari.to_jsstring(lua.lua_tostring(L, 2))

  const attr = graph.getAttribute(id, key)

  return returnString(L, attr)
})

define('getNeighbor', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1
  const neighborIndex = lua.lua_tonumber(L, 2) - 1

  const neighborId = graph.getNeighbor(id, neighborIndex)

  return returnIndex(L, neighborId)
})

define('getNeighborCount', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1

  const neighborCount = graph.getNeighborCount(id)

  return returnNumber(L, neighborCount)
})

define('getVertexCount', (graph: Graph) => (L: {}) => {
  const count = graph.vertices.length

  return returnNumber(L, count)
})

define('getEdgeCount', (graph: Graph) => (L: {}) => {
  const count = graph.edges.length

  return returnNumber(L, count)
})

define('getEdge', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1

  const edge = graph.getEdge(id)

  return returnEdge(L, edge)
})

define('getRandomVertex', (graph: Graph) => (L: {}) => {
  const id = graph.getRandomVertex()

  return returnIndex(L, id)
})

define('getRandomEdge', (graph: Graph) => (L: {}) => {
  const edge = graph.getRandomEdge()

  return returnEdge(L, edge)
})

define('getRandomNeighbor', (graph: Graph) => (L: {}) => {
  const id = lua.lua_tonumber(L, 1) - 1

  const neighborId = graph.getRandomNeighbor(id)

  return returnIndex(L, neighborId)
})

const returnEdge = (L: {}, edge?: Edge) => {
  if (edge !== undefined) {
    const [a, b] = edge
    lua.lua_pushnumber(L, a + 1)
    lua.lua_pushnumber(L, b + 1)
    return 2
  } else {
    lua.lua_pushnil(L)
    return 1
  }
}

const returnIndex = (L: {}, id?: VertexId | EdgeId) => {
  // All indexes in lua are 1-based, so this translates to that and sends.
  if (id !== undefined) {
    lua.lua_pushnumber(L, id + 1)
  } else {
    lua.lua_pushnil(L)
  }
  return 1
}

const returnNumber = (L: {}, num?: number) => {
  if (num !== undefined) {
    lua.lua_pushnumber(L, num)
  } else {
    lua.lua_pushnil(L)
  }
  return 1
}

const returnString = (L: {}, str?: string) => {
  if (str !== undefined) {
    lua.lua_pushstring(L, str)
  } else {
    lua.lua_pushnil(L)
  }
  return 1
}
