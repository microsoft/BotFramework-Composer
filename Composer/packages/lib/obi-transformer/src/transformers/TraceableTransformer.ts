import { TransformerPolicyCollection } from './types/TransformerPolicy';
import { TraceableAnalyzerResult, AnalyzerResult } from '../analyzers/types/AnalyzerResult';
import { DirectedGraphNode } from '../models/graph/DirectedGraphNode';

export class TraceableTransformer {
  constructor(private transformerPolicy: TransformerPolicyCollection) {}

  transform(input: TraceableAnalyzerResult): AnalyzerResult<DirectedGraphNode<string, any>> {
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
