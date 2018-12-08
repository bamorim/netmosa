const e = (name: string, file: string) => ({
  name,
  load: () => fetch(file).then((resp) => resp.text())
})

export const barabasiAlbert = e('Barabasi Albert', require('./barabasi_albert.lua'))
export const randomWalk = e('Random Walk', require('./random_walk.lua'))

const examples = [
  barabasiAlbert,
  randomWalk
]

export default examples;