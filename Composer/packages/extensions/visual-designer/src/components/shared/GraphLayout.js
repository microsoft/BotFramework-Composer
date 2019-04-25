import { Boundary } from './Boundary';

export class GraphLayout {
  boundary;
  nodes = [];
  edges = [];

  constructor(boundary = new Boundary(), nodes = [], edges = []) {
    this.boundary = boundary;
    this.nodes = nodes;
    this.edges = edges;
  }
}
