declare module "fengari-web" {
  type int = number;
  type lua_State = any;
  type lua_CFunction = (L: lua_State) => int;
  type lua_KContext = any;
  type lua_KFunction = (L: lua_State, status: int, ctx: lua_KContext) => int
  type lua_String = any;

  interface lua {
    lua_pcall: (L: lua_State, nargs: int, nresults: int, msgh: int) => int
    lua_getglobal: (L: lua_State, name: string) => int
    lua_setglobal: (L: lua_State, name: string) => int
    lua_resume: (L: lua_State, from: lua_State | null, nargs: int) => int
    lua_tonumber: (L: lua_State, index: int) => number
    lua_tostring: (L: lua_State, index: int) => string
    lua_gettop: (L: lua_State) => int
    lua_newthread: (L: lua_State) => lua_State
    lua_pushcfunction: (L: lua_State, f: lua_CFunction) => void
    lua_pushnumber: (L: lua_State, n: number) =>  void
    lua_pushstring: (L: lua_State, n: lua_String) =>  void
  }

  interface lualib {
    luaL_openlibs: (L: lua_State) => void
  }

  interface lauxlib {
    luaL_newstate: () => lua_State,
    luaL_loadstring: (L: lua_State, code: lua_String) => int
  }

  interface Fengari {
    lua: lua,
    lualib: lualib,
    lauxlib: lauxlib,
    to_luastring: (string: string) => lua_String
    to_jsstring: (string: lua_String) => string
  }

  const fengari: Fengari;

  export = fengari
}