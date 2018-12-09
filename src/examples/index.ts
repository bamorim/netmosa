import barabasiAlbertFile from "./barabasi_albert.lua"
import randomWalkFile from "./random_walk.lua"

const e = (name: string, file: string) => ({
  name,
  load: () => fetch(file).then(resp => resp.text())
})

export const barabasiAlbert = e("Barabasi Albert", barabasiAlbertFile)
export const randomWalk = e("Random Walk", randomWalkFile)

const examples = [barabasiAlbert, randomWalk]

export default examples
