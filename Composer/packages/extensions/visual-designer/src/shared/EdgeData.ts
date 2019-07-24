export class EdgeData {
  id: string = '';
  direction: 'x' | 'y' = 'x';
  x: number = 0;
  y: number = 0;
  length: number = 0;
  text?: string = '';
  dashed?: boolean = false;
  directed?: boolean = false;
}
