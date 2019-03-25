import { TraceableTransformerPolicy } from './types/TransformerPolicy';
import { TraceableSelectionResult } from '../selectors/types/SelectionResult';
import { DirectedGraphNode } from '../types/DirectedGraphNode';
import { StringIndexedCollection } from '../types/StringIndexedCollection';

/**
 * Convert upriver result from 'selector' with type 'TraceableData' to directed graph nodes.
 * Specify the 'PayloadType' to instantiate output schema.
 */
export class TraceableTransformer<PayloadType> {
  constructor(private transformerPolicy: TraceableTransformerPolicy<PayloadType>) {}

  transform(
    input: TraceableSelectionResult<PayloadType>
  ): StringIndexedCollection<DirectedGraphNode<string, PayloadType>[]> {
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
