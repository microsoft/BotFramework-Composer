import { PAYLOAD_KEY } from './constant';

export class ObiTransformer {
  toDirectedGraphSchema(obiJson) {
    try {
      const rules = obiJson['rules'];
      const results = rules.map((x, index) => ({
        id: index,
        [PAYLOAD_KEY]: x,
        neighborIds: [],
      }));

      for (let i = 0; i < results.length - 1; i++) {
        results[i].neighborIds.push(results[i + 1].id);
      }
      return results;
    } catch (e) {
      return [];
    }
  }
}
