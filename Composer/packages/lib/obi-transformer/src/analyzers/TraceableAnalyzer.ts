import { AnalyzerDefinition } from './types/Analyzer';
import { TraceableData } from './types/TraceableData';
import { TraceableAnalyzerResult } from './types/AnalyzerResult';

export class TraceableAnalyzer<InputSchema> {
  private analyzer: AnalyzerDefinition<InputSchema, TraceableData<any>, TraceableAnalyzerResult>;

  constructor(transformDefinition: AnalyzerDefinition<InputSchema, TraceableData<any>, TraceableAnalyzerResult>) {
    const { before, execution, after } = transformDefinition;
    if (!execution) {
      throw new TypeError(`Analyzer constructor failed: missing [execution] filed.`);
    }

    this.analyzer = transformDefinition;
  }

  public analyze(input: InputSchema) {
    // Before
    this.executeBeforeValidation(input);

    // Select + Validate
    const result = this.executeSelection(input);

    // After
    this.executeAfterValidation(result);
    return result;
  }

  private executeBeforeValidation(input: InputSchema): void {
    const { before } = this.analyzer;
    // Validate input schema before executing transformation.
    if (Array.isArray(before)) {
      for (let i = 0; i < before.length; i++) {
        const validated = before[i](input);
        if (false === validated) {
          throw new TypeError(`Validation failed: [before][${i}].`);
        }
      }
    }
  }

  private executeSelection(input: InputSchema): TraceableAnalyzerResult {
    const { execution: executionDefinition } = this.analyzer;

    // Generate to be transformed keys from transformDefinition.
    const features = Object.keys(executionDefinition);

    // Generate selected elements to traceable representations.
    const traceableResult = features.reduce((accumulatedResult, currentTopic) => {
      const { select, validate } = executionDefinition[currentTopic];
      // Select data from input schema.
      let selectedElements = [];
      try {
        selectedElements = select(input);
      } catch (e) {
        throw new TypeError(`Transformation failed: [select] failed at field [${currentTopic}]. Reason: ${e.message}`);
      }

      // Validate the selection result.
      selectedElements.forEach((x, index) => {
        if (!validate(x)) {
          throw new TypeError(`Transformation failed: [validate] failed at data [${currentTopic}][${index}].`);
        }
      });

      return {
        ...accumulatedResult,
        [currentTopic]: selectedElements,
      };
    }, {});
    return traceableResult;
  }

  private executeAfterValidation(result: TraceableAnalyzerResult): void {
    const { after } = this.analyzer;
    // Validate transformed result after executing transformation.
    if (Array.isArray(after)) {
      for (let i = 0; i < after.length; i++) {
        const valdiated = after[i](result);
        if (false === valdiated) {
          throw new TypeError(`Validation failed: [after][${i}]`);
        }
      }
    }
  }
}
