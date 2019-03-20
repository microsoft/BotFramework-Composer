import { DialogTypes } from './types/DialogTypes';
import { StorageTypes } from './types/StorageTypes';
import { RecognizerTypes } from './types/RecognizerTypes';
import { Rule } from './ObiRule';

export class ObiSchema {
  '$schema': string;
  '$types': DialogTypes;
  '$id': string;

  'storage': {
    $type: StorageTypes;
  };

  'recognizer': {
    $type: RecognizerTypes;
  };

  'rules': Rule[];
}
