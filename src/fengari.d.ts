declare module 'fengari-web' {
  type int = number
  type lua_State = any
  type lua_CFunction = (L: lua_State) => int
  type lua_KContext = any
  type lua_KFunction = (L: lua_State, status: int, ctx: lua_KContext) => int
  type lua_String = any

  class Debug {
    public currentline: number
  }

  interface lua {
    lua_Debug: typeof Debug
    lua_getglobal: (L: lua_State, name: string) => int
    lua_getinfo: (L: lua_State, flags: lua_String, d: Debug) => int
    lua_getstack: (L: lua_State, index: int, d: Debug) => int
    lua_gettop: (L: lua_State) => int
    lua_newthread: (L: lua_State) => lua_State
    lua_pcall: (L: lua_State, nargs: int, nresults: int, msgh: int) => int
    lua_pushboolean: (L: lua_State, b: boolean) => void
    lua_pushcfunction: (L: lua_State, f: lua_CFunction) => void
    lua_pushnil: (L: lua_State) => void
    lua_pushnumber: (L: lua_State, n: number) => void
    lua_pushstring: (L: lua_State, s: lua_String) => void
    lua_resume: (L: lua_State, from: lua_State | null, nargs: int) => int
    lua_setglobal: (L: lua_State, name: string) => int
    lua_tonumber: (L: lua_State, index: int) => number
    lua_tostring: (L: lua_State, index: int) => string
  }

  interface lualib {
    luaL_openlibs: (L: lua_State) => void
  }

  interface lauxlib {
    luaL_newstate: () => lua_State
    luaL_loadstring: (L: lua_State, code: lua_String) => int
  }

  interface Fengari {
    lua: lua
    lualib: lualib
    lauxlib: lauxlib
    to_luastring: (string: string, config?: boolean) => lua_String
    to_jsstring: (string: lua_String) => string
  }

  const fengari: Fengari

  export = fengari
}
