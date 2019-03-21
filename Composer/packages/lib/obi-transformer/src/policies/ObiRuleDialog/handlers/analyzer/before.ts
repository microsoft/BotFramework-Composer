import { ObiSchema } from '../../../../models/obi/ObiSchema';
import { DialogTypes } from '../../../../models/obi/types/DialogTypes';

export function shouldBeRuleDialog(obi: ObiSchema): boolean {
  return obi.$type === DialogTypes.RuleDialog;
}

export function shouldBeSequenceDialog(obi: ObiSchema): boolean {
  return obi.$type === DialogTypes.SequenceDialog;
}
