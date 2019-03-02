import { VertexId, EdgeId, Edge } from 'model/types'

export interface AddedVertex {
  type: 'AddedVertex'
  id: VertexId
}

export interface AddedEdge {
  type: 'AddedEdge'
  id: EdgeId
  edge: Edge
}

export interface SetAttribute {
  type: 'SetAttribute'
  id: VertexId
  key: string
  value: string
}

type GraphEvent = AddedVertex | AddedEdge | SetAttribute

export default GraphEvent
