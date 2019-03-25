import { ObiRule } from './ObiRule';
import { ObiRecognizer } from './ObiRecognizer';
import { ObiStorage } from './ObiStorage';
import { ObiBaseSchema } from './ObiBaseSchema';

export class ObiRuleDialog extends ObiBaseSchema {
  storage: ObiStorage;
  recognizer: ObiRecognizer;

  rules: ObiRule[];
}
