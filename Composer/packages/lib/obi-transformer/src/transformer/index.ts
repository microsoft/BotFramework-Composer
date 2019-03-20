import { DirectedGraphNode } from '../models/DirectedGraphNode';

export class ObiTransformer {
  public toDirectedGraphSchema(obiJson: any, payloadKey: string): DirectedGraphNode<string>[] {
    try {
      const rules = obiJson['rules'];
      const results = rules.map((x, index) => ({
        id: index,
        [payloadKey]: x,
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
