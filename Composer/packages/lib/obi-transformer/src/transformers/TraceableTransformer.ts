import { TransformerPolicy } from './types/TransformerPolicy';
import { TraceableSelectionResult, SelectionResult } from '../selectors/types/SelectionResult';
import { DirectedGraphNode } from '../types/DirectedGraphNode';

export class TraceableTransformer {
  constructor(private transformerPolicy: TransformerPolicy) {}

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
