import * as fengari from 'fengari-web';

import { Graph } from 'graph';
import { openStdLib } from "./stdlib";

const lua = fengari.lua;
const lauxlib = fengari.lauxlib;
const lualib = fengari.lualib;

const wrapCode = (code: string) => `
function render()
  coroutine.yield()
end

function main()
  ${code}
end
`;

export const luaModel: (code: string) => (graph: Graph) => IterableIterator<Graph> = (code: string) => function* (graph: Graph) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  openStdLib(L, graph);

  lauxlib.luaL_loadstring(L, fengari.to_luastring(wrapCode(code)));
  lua.lua_pcall(L, 0, 0, 0);
  const L2 = lua.lua_newthread(L);
  lua.lua_getglobal(L2, 'main');

  while (true) {
    const resp = lua.lua_resume(L2, null, 0);
    yield graph;
    if (resp === 0) {
      break;
    }
  }
};