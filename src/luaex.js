const fengari = require("fengari");

const lua = fengari.lua;
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib


const code = `
function main()
  function sum(a, b) return a + b end
  local counter = 0
  while counter
  do
      print("Sending " .. counter);
      coroutine.yield(counter);
      counter = sum(counter, 11);
  end
end
`

const L = lauxlib.luaL_newstate()
lualib.luaL_openlibs(L)
lauxlib.luaL_loadstring(L, fengari.to_luastring(code))
lua.lua_pcall(L, 0, 0, 0)
const L2 = lua.lua_newthread(L)
lua.lua_getglobal(L2, "main")
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))
lua.lua_resume(L2, null, 0)
console.log(lua.lua_tonumber(L2, lua.lua_gettop(L2)))