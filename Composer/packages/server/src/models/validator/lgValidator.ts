import { StaticChecker, Diagnostic as LGDiagnostic } from 'botbuilder-lg';

import { Resource, ResourceResolver, ResourceType } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { Diagnostic, Range, Position } from './diagnostic';

export class LGValidator implements ResourceValidator {
  public validate = (resource: Resource, _resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.LG) {
      throw new Error(`Can't apply LGValidator to resource type ${resource.type}`);
    }

    // TODO: when we have multiple lg, we should make StaticChecker accept resource resolver
    try {
      // NOTE: there is an issue with LG StaticChecker that requires a full path as id
      // which should be fixed later in lg package
      const diagnostics = new StaticChecker().checkText(resource.content, 'c:/common.lg');
      return diagnostics.map(d => {
        return this.convertLGDiagnostic(d, resource.id);
      });
    } catch (err) {
      return [new Diagnostic(err.message, resource.id)];
    }
  };

  // NOTE: LGDiagnostic is defined in PascalCase which should be corrected
  private convertLGDiagnostic(d: LGDiagnostic, source: string): Diagnostic {
    const result = new Diagnostic(d.Message, source, d.Severity);

    const start: Position = new Position(d.Range.Start.Line, d.Range.Start.Character);
    const end: Position = new Position(d.Range.End.Line, d.Range.End.Character);
    result.range = new Range(start, end);

    return result;
  }
}
