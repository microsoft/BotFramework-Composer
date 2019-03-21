import { DialogTypes } from './types/DialogTypes';
import { ObiRule } from './ObiRule';
import { ObiRecognizer } from './ObiRecognizer';
import { ObiStorage } from './ObiStorage';

export class ObiSchema {
  $schema: string;
  $type: DialogTypes;
  $id: string;

  storage: ObiStorage;
  recognizer: ObiRecognizer;

  rules: ObiRule[];
}
