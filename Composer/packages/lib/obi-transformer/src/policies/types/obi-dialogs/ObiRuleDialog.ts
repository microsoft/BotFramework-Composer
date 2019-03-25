import { ObiRule } from '../obi-elements/ObiRule';
import { ObiRecognizer } from '../obi-elements/ObiRecognizer';
import { ObiStorage } from '../obi-elements/ObiStorage';
import { ObiBaseSchema } from '../ObiBaseSchema';

export class ObiRuleDialog extends ObiBaseSchema {
  storage: ObiStorage;
  recognizer: ObiRecognizer;

  rules: ObiRule[];
}
