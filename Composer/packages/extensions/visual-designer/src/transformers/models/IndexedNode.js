import { PAYLOAD_KEY } from '../../utils/constant';

export class IndexedNode {
  constructor(id, type, payload) {
    this.id = id;
    this.type = type;
    this[PAYLOAD_KEY] = payload;
  }
}
