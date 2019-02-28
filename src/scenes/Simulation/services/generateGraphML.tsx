import * as xmlbuilder from 'xmlbuilder'
import { ReadGraph } from 'graph'
import union from 'ramda/es/union'

export const generateGraphML = (graph: ReadGraph) => {
  const keyXml = graph.vertices
    .map(v => Array.from(v.attributes.keys()))
    .reduce((agg, curr) => union(agg, curr), [])
    .map(key => ({
      '@id': `d${key}`,
      '@for': 'node',
      '@attr.name': key,
      '@attr.type': 'string',
      default: key === 'color' ? [{ '#text': 'white' }] : []
    }))

  const nodeXml = graph.vertices.map((v, i) => ({
    '@id': `n${i}`,
    data: Array.from(v.attributes.keys()).map(key => ({
      '@key': `d${key}`,
      '#text': v.attributes.get(key)!
    }))
  }))

  const edgeXml = graph.edges.map(([s, t], i) => ({
    '@source': `n${s}`,
    '@target': `n${t}`
  }))
  const graphXml = {
    graphml: {
      '@xmlns': 'http://graphml.graphdrawing.org/xmlns',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation': [
        'http://graphml.graphdrawing.org/xmlns',
        'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd'
      ].join(' '),
      key: keyXml,
      graph: {
        '@id': 'G',
        '@edgedefault': 'undirected',
        node: nodeXml,
        edge: edgeXml
      }
    }
  }
  const xml = xmlbuilder
    .create(graphXml, { encoding: 'utf-8' })
    .end({ pretty: true })
  return new Blob([xml], { type: 'application/graphml+xml;charset=utf-8' })
}
