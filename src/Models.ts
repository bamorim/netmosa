import * as fengari from 'fengari-web';

import {Graph, Model} from './Model';

const lua = fengari.lua;
const lauxlib = fengari.lauxlib;
const lualib = fengari.lualib;

const wrapCode = (code: string) => `
function main()
  ${code}
end
`;

export const luaModel: (code: string) => Model =
    (code: string) => function*(graph: Graph) {
      const stdlib: Map<string, (L: {}) => number> = new Map();

      stdlib.set('addVertex', (L: {}) => {
        lua.lua_pushnumber(L, graph.addVertex() + 1);
        return 1;
      });

      stdlib.set('connectVertices', (L: {}) => {
        const pos1 = lua.lua_tonumber(L, 1) - 1;
        const pos2 = lua.lua_tonumber(L, 2) - 1;
        graph.connectVertices(pos1, pos2);
        return 0;
      });

      stdlib.set('setAttributes', (L: {}) => {
        const pos = lua.lua_tonumber(L, 1) - 1;
        const key = fengari.to_jsstring(lua.lua_tostring(L, 2));
        const val = fengari.to_jsstring(lua.lua_tostring(L, 3));
        graph.vertices[pos].attributes.set(key, val);
        return 0;
      });

      stdlib.set('getAttributes', (L: {}) => {
        const pos = lua.lua_tonumber(L, 1) - 1;
        const key = fengari.to_jsstring(lua.lua_tostring(L, 2));
        const attr = graph.vertices[pos].attributes.get(key) || '';
        lua.lua_pushstring(L, fengari.to_luastring(attr));
        return 0;
      });

      stdlib.set('getNeighbor', (L: {}) => {
        const pos = lua.lua_tonumber(L, 1) - 1;
        const neighborIndex = lua.lua_tonumber(L, 2) - 1;
        const neighborPos = graph.vertices[pos].neighbors[neighborIndex];
        lua.lua_pushnumber(L, neighborPos + 1);
        return 1;
      });

      stdlib.set('getNeighborCount', (L: {}) => {
        const pos = lua.lua_tonumber(L, 1) - 1;
        lua.lua_pushnumber(L, graph.vertices[pos].neighbors.length);
        return 1;
      });

      stdlib.set('getVertexCount', (L: {}) => {
        lua.lua_pushnumber(L, graph.vertices.length);
        return 1;
      });

      stdlib.set('getEdgeCount', (L: {}) => {
        lua.lua_pushnumber(L, graph.edges.length);
        return 1;
      });

      stdlib.set('getEdge', (L: {}) => {
        const idx = lua.lua_tonumber(L, 1) - 1;
        const [a, b] = graph.edges[idx];
        lua.lua_pushnumber(L, a + 1);
        lua.lua_pushnumber(L, b + 1);
        return 2;
      });

      const L = lauxlib.luaL_newstate();
      lualib.luaL_openlibs(L);

      for (const key of stdlib.keys()) {
        lua.lua_pushcfunction(L, stdlib.get(key)!);
        lua.lua_setglobal(L, key);
      }

      lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)));
      lua.lua_pcall(L, 0, 0, 0);
      const L2 = lua.lua_newthread(L);
      lua.lua_getglobal(L2, 'main');

      while (true) {
        const resp = lua.lua_resume(L2, null, 0);
        yield graph;
        if (resp === 0) break;
      }
    };