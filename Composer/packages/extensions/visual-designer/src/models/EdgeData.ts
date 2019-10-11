export class EdgeData {
  id = '';
  direction: 'x' | 'y' = 'x';
  x = 0;
  y = 0;
  length = 0;
  text?: string = '';
  dashed?: boolean = false;
  directed?: boolean = false;
  invertDirected?: boolean = false;
}
