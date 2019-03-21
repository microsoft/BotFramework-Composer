import { AnalyzerDefinition } from './types/Analyzer';
import { TraceableData } from './types/TraceableData';
import { TraceableAnalyzerResult } from './types/AnalyzerResult';

export class TraceableAnalyzer<InpuSchema> {
  private analyzer: AnalyzerDefinition<InpuSchema, TraceableData<any>, TraceableAnalyzerResult>;

  constructor(transformDefinition: AnalyzerDefinition<InpuSchema, TraceableData<any>, TraceableAnalyzerResult>) {
    this.analyzer = transformDefinition;
  }

  public analyze(input: InpuSchema) {
    const { before, execution, after } = this.analyzer;
    if (!execution) {
      throw new TypeError(`Validation failed: missing [execution] filed.`);
    }

    // Validate input schema before executing transformation.
    if (Array.isArray(before)) {
      for (let i = 0; i < before.length; i++) {
        const validated = before[i](input);
        if (false === validated) {
          throw new TypeError(`Validation failed: [before][${i}].`);
        }
      }
    }

    // Transform.
    const result = this.executeTransformation(input);

    // Validate transformed result after executing transformation.
    if (Array.isArray(after)) {
      for (let i = 0; i < after.length; i++) {
        const valdiated = after[i](result);
        if (false === valdiated) {
          throw new TypeError(`Validation failed: [after][${i}]`);
        }
      }
    }

    return result;
  }

  private executeTransformation(input: InpuSchema): TraceableAnalyzerResult {
    const { execution: executionDefinition } = this.analyzer;

    // Generate to be transformed keys from transformDefinition.
    const features = Object.keys(executionDefinition);

    const result = features.reduce((accumulatedResult, currentTopic) => {
      const { select, transform, validate } = executionDefinition[currentTopic];
      // Select data from input schema.
      let selectedElements = [];
      try {
        selectedElements = select(input);
      } catch (e) {
        throw new TypeError(`Transformation failed: [select] failed at field [${currentTopic}]. Reason: ${e.message}`);
      }

      // Validate the transformation result.
      selectedElements.forEach((x, index) => {
        if (!validate(x)) {
          throw new TypeError(`Transformation failed: [validate] failed at data [${currentTopic}][${index}].`);
        }
      });

      // Perform transformation.
      const transformedElements = selectedElements.map((element, index) => {
        let transformedData;
        try {
          transformedData = transform(element);
        } catch (e) {
          throw new TypeError(
            `Transformation failed: [transform] failed at data [${currentTopic}][${index}]. Reason: ${e.message}`
          );
        }
        return transformedData;
      });

      return {
        ...accumulatedResult,
        [currentTopic]: transformedElements,
      };
    }, {});
    return result;
  }
}
