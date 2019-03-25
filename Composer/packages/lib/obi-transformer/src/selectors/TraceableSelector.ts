import { TraceableSelectorPolicy } from './types/SelectorPolicy';
import { TraceableSelectionResult } from './types/SelectionResult';

export class TraceableSelector<InputSchema, PayloadType> {
  private policy: TraceableSelectorPolicy<InputSchema, PayloadType>;

  constructor(selectorPolicy: TraceableSelectorPolicy<InputSchema, PayloadType>) {
    const { before, execution, after } = selectorPolicy;
    if (!execution) {
      throw new TypeError(`Analyzer constructor failed: missing [execution] filed.`);
    }

    this.policy = selectorPolicy;
  }

  public select(input: InputSchema): TraceableSelectionResult<PayloadType> {
    // Before
    this.executeBeforeValidation(input);

    // Select + Validate
    const result = this.executeSelection(input);

    // After
    this.executeAfterValidation(result);
    return result;
  }

  private executeBeforeValidation(input: InputSchema): void {
    const { before } = this.policy;
    // Validate input schema before executing selection.
    if (Array.isArray(before)) {
      for (let i = 0; i < before.length; i++) {
        const validated = before[i](input);
        if (!validated) {
          throw new TypeError(`Validation failed: [before][${i}].`);
        }
      }
    }
  }

  private executeSelection(input: InputSchema): TraceableSelectionResult<PayloadType> {
    const { execution: executionDefinition } = this.policy;

    // Generate to be selected keys from selectionPolicy.
    const features = Object.keys(executionDefinition);

    // Generate selected elements to traceable representations.
    const traceableResult = features.reduce((accumulatedResult, currentTopic) => {
      const { select, validate } = executionDefinition[currentTopic];
      // Select data from input schema.
      let selectedElements = [];
      try {
        selectedElements = select(input);
      } catch (e) {
        throw new TypeError(`Selection failed: [select] failed at field [${currentTopic}]. Reason: ${e.message}`);
      }

      // Validate the selection result.
      selectedElements.forEach((x, index) => {
        if (!validate(x)) {
          throw new TypeError(`Selection failed: [validate] failed at data [${currentTopic}][${index}].`);
        }
      });

      return {
        ...accumulatedResult,
        [currentTopic]: selectedElements,
      };
    }, {});
    return traceableResult;
  }

  private executeAfterValidation(result: TraceableSelectionResult<PayloadType>): void {
    const { after } = this.policy;
    // Validate selected result after executing selection.
    if (Array.isArray(after)) {
      for (let i = 0; i < after.length; i++) {
        const valdiated = after[i](result);
        if (!valdiated) {
          throw new TypeError(`Validation failed: [after][${i}]`);
        }
      }
    }
  }
}
