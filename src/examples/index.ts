import barabasiAlbertFile from './barabasi_albert.lua'
import nrrwFile from './nrrw.lua'
import bgrwFile from './bgrw.lua'
import gnpFile from './gnp.lua'

const e = (name: string, file: string) => ({
  name,
  load: () => fetch(file).then(resp => resp.text())
})

export const barabasiAlbert = e('Barabasi-Albert', barabasiAlbertFile)
export const nrrw = e('NRRW', nrrwFile)
export const bgrw = e('BGRW', bgrwFile)
export const gnp = e('GNP', gnpFile)

const examples = [barabasiAlbert, nrrw, bgrw, gnp]

export default examples
