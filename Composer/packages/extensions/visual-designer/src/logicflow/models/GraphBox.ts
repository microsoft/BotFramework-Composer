import { Boundary } from '../../shared/Boundary';

class CoordPoint {
  x: number;
  y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

export class GraphBox {
  id: string;
  boundary: Boundary;
  offset: CoordPoint;
  data?: any;

  constructor(id: string, boundary: Boundary, offset = new CoordPoint()) {
    this.id = id;
    this.boundary = boundary;
    this.offset = offset;
  }
}
