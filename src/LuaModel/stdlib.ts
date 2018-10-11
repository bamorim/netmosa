import * as fengari from 'fengari-web';
const lua = fengari.lua;

import { Graph, Model } from '../Model';

type StdLibFunction = (graph: Graph) => (L: {}) => number;

export interface StdLibEntry {
  fn: StdLibFunction;
  name: string;
  docs: string;
}

const stdlib: Array<StdLibEntry> = [];

const define = (name: string, docs: string, fn: StdLibFunction) => {
  stdlib.push({ name, fn, docs })
}

export const openStdLib = (L: {}, graph: Graph) => {
  for (const func of stdlib) {
    lua.lua_pushcfunction(L, func.fn(graph));
    lua.lua_setglobal(L, func.name);
  }
}


// TODO: Study viability of: Remove vertices / edges
// TODO: Some auxiliary functions such as: getRandomNeighbor, getRandomNode, getRandomEdge

define(
  'addVertex',
  'Adds a new vertex and returns its index.',
  (graph: Graph) => (L: {}) => {
    lua.lua_pushnumber(L, graph.addVertex() + 1);
    return 1;
  }
);

define(
  'connectVertices',
  'Connect two vertices by their indexes.',
  (graph: Graph) => (L: {}) => {
    const pos1 = lua.lua_tonumber(L, 1) - 1;
    const pos2 = lua.lua_tonumber(L, 2) - 1;
    graph.connectVertices(pos1, pos2);

    // Maybe return edge idx?
    return 0;
  }
);

// Maybe add more attributes on render such as size
define(
  'setAttributes',
  `
  Set attributes for a vertex, receiving the vertex index, the attribute name and value.
  One useful attribute is "color", which is used in the rendering.
  `,
  (graph: Graph) => (L: {}) => {
    const pos = lua.lua_tonumber(L, 1) - 1;
    const key = fengari.to_jsstring(lua.lua_tostring(L, 2));
    const val = fengari.to_jsstring(lua.lua_tostring(L, 3));
    graph.vertices[pos].attributes.set(key, val);
    return 0;
  }
);

define(
  'getAttributes',
  `Gets the value of a previously set attribute.`,
  (graph: Graph) => (L: {}) => {
    const pos = lua.lua_tonumber(L, 1) - 1;
    const key = fengari.to_jsstring(lua.lua_tostring(L, 2));
    const attr = graph.vertices[pos].attributes.get(key) || '';
    lua.lua_pushstring(L, fengari.to_luastring(attr));
    return 1;
  }
);

define(
  'getNeighbor',
  'Get the index of a neighbor vertex, receiving the vertex index and the neighbor index.',
  (graph: Graph) => (L: {}) => {
    const pos = lua.lua_tonumber(L, 1) - 1;
    const neighborIndex = lua.lua_tonumber(L, 2) - 1;
    const neighborPos = graph.vertices[pos].neighbors[neighborIndex];
    lua.lua_pushnumber(L, neighborPos + 1);
    return 1;
  }
);

define(
  'getNeighborCount',
  `
  Get the number of neighbors a given vertex (by index) has.
  Useful for iterating through neighbors or getting a neighbor at random.
  `,
  (graph: Graph) => (L: {}) => {
    const pos = lua.lua_tonumber(L, 1) - 1;
    lua.lua_pushnumber(L, graph.vertices[pos].neighbors.length);
    return 1;
  }
);

define(
  'getVertexCount',
  `
  Get the number of vertices the graph has.
  Useful for iterating through all vertices or getting one at random.
  `,
  (graph: Graph) => (L: {}) => {
    lua.lua_pushnumber(L, graph.vertices.length);
    return 1;
  }
);

define(
  'getEdgeCount',
  `
  Get the number of edges the graph has.
  Useful for iterating through all edges or getting one at random.
  `,
  (graph: Graph) => (L: {}) => {
    lua.lua_pushnumber(L, graph.edges.length);
    return 1;
  }
);

define(
  'getEdge',
  `Get an edge by it's index. It is useful if you want to get the edge ends.`,
  (graph: Graph) => (L: {}) => {
    const idx = lua.lua_tonumber(L, 1) - 1;
    const [a, b] = graph.edges[idx];
    lua.lua_pushnumber(L, a + 1);
    lua.lua_pushnumber(L, b + 1);
    return 2;
  }
);