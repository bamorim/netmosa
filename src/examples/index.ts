import barabasiAlbertFile from './barabasi_albert.lua'
import nrrwFile from './nrrw.lua'
import bgrwFile from './bgrw.lua'
import gnpFile from './gnp.lua'
import randomTreeFile from './random_tree.lua'

const e = (name: string, file: string) => ({
  name,
  load: () => fetch(file).then(resp => resp.text())
})

export const barabasiAlbert = e('Barabási–Albert', barabasiAlbertFile)
export const nrrw = e('No Restarting Random Walk (NRRW)', nrrwFile)
export const bgrw = e('Bernoulli Growth Random Walk (BGRW)', bgrwFile)
export const gnp = e('Erdős–Rényi (GNP)', gnpFile)
export const randomTree = e('Uniform Random Tree', randomTreeFile)

const examples = [barabasiAlbert, nrrw, bgrw, gnp, randomTree]

export default examples
