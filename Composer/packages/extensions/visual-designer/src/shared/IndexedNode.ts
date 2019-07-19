export class IndexedNode {
  id: string;
  json: any;
  constructor(id, payload) {
    this.id = id;
    this.json = payload;
  }
}
