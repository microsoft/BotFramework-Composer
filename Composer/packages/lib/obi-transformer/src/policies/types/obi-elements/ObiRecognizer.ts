import { RecognizerTypes } from '../obi-enums/ObiRecognizerTypes';

export class ObiRecognizer {
  $type: RecognizerTypes;
  rules: { [ruleName: string]: string };
}
