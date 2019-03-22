import { TransformerPolicyCollection } from './types/TransformerPolicy';
import { TraceableSelectionResult, SelectionResult } from '../analyzers/types/SelectionResult';
import { DirectedGraphNode } from '../models/graph/DirectedGraphNode';

export class TraceableTransformer {
  constructor(private transformerPolicy: TransformerPolicyCollection) {}

  transform(input: TraceableSelectionResult): SelectionResult<DirectedGraphNode<string, any>> {
    const topics = Object.keys(this.transformerPolicy);

    return topics.reduce((acc, key) => {
      const transformerFn = this.transformerPolicy[key];
      const transformed = input[key].map(transformerFn);
      return {
        ...acc,
        [key]: transformed,
      };
    }, {});
  }
}
