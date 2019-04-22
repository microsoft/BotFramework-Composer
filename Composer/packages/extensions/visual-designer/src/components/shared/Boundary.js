class Point {
  x = 0;
  y = 0;
}

export class Boundary {
  width = 0;
  height = 0;
  in = new Point();
  out = new Point();

  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
    this.in = { x: width / 2, y: 0 };
    this.out = { x: width / 2, y: height };
  }
}
