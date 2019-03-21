import { RecognizerTypes } from './types/RecognizerTypes';

export class ObiRecognizer {
  $type: RecognizerTypes;
  rules: { [ruleName: string]: string };
}
