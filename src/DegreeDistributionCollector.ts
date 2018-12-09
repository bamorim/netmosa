import { Change, ReadGraph } from "./graph";

export default class DegreeDistributionCollector {
  public distribution: number[] = [];
  private graph: ReadGraph;

  constructor(graph: ReadGraph) {
    this.graph = graph;
    this.graph.subject.subscribe(this.onChange);
  }

  public onChange = (change: Change) => {
    switch(change.type) {
      case 'AddedVertex':
        this.changeDist(0, 1);
        break;
      case 'AddedEdge':
        const [v1, v2] = this.graph.edges[change.id]
        const neighborCount1 = this.graph.vertices[v1].neighbors.length;
        const neighborCount2 = this.graph.vertices[v2].neighbors.length;

        this.changeDist(neighborCount1, -1);
        this.changeDist(neighborCount1 + 1, +1);
        this.graph.vertices[v1].neighbors.push(v2);

        if(v1 !== v2) {
          this.changeDist(neighborCount2, -1);
          this.changeDist(neighborCount2 + 1, +1);
          this.graph.vertices[v2].neighbors.push(v1);
        }
        break;
      default:
    }
  }

  private changeDist = (idx: number, amt: number) => {
    this.distribution[idx] = this.distribution[idx] || 0
    this.distribution[idx] += amt
  }
}