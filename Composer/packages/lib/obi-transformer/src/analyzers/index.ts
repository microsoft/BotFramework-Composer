import { ObiSchema } from '../models/obi/ObiSchema';
import { ruleDialogAnalyzer } from './ruleDialogAnalyzer';
import { Analyzer, AnalyzerTransformationCollection } from './types/Analyzer';
import { TraceableData } from './types/TraceableData';
import { RuleDialogComponents } from './types/RuleDialogComponents';

export class ObiTransformer {
  private executeTransformation(
    input: ObiSchema,
    transformDefinition: AnalyzerTransformationCollection<ObiSchema, TraceableData<any>>
  ): RuleDialogComponents {
    const shapeOfResult = new RuleDialogComponents();

    const result = Object.keys(shapeOfResult).reduce((accumulatedResult, currentTopic) => {
      const { select, transform, validate } = transformDefinition[currentTopic];
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
    }, shapeOfResult);
    return result;
  }

  public analyzeObiSchema(input: ObiSchema, analyzer: Analyzer<ObiSchema, TraceableData<any>, RuleDialogComponents>) {
    const { before, transform, after } = analyzer;
    if (!transform) {
      throw new TypeError(`Validation failed: missing [transform] filed.`);
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
    const result = this.executeTransformation(input, transform);

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
}
