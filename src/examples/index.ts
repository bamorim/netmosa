import barabasiAlbertFile from './barabasi_albert.lua'
import nrrwFile from './nrrw.lua'
import gnpFile from './gnp.lua'

const e = (name: string, file: string) => ({
  name,
  load: () => fetch(file).then(resp => resp.text())
})

export const barabasiAlbert = e('Barabasi-Albert', barabasiAlbertFile)
export const randomWalk = e('NRRW', nrrwFile)
export const gnp = e('GNP', gnpFile)

const examples = [barabasiAlbert, randomWalk, gnp]

export default examples
