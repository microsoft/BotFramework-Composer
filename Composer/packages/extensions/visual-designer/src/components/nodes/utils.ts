import get from 'lodash.get';
import { ConceptLabels } from 'shared';

import { ObiTypes } from '../../constants/ObiTypes';

export function getFriendlyName(data) {
  // use the developer-specified name if it exists...
  if (get(data, '$designer.name')) {
    return get(data, '$designer.name');
  }

  // otherwise, if we have a friendly name defined at the schema level...
  if (ConceptLabels[data.$type] && ConceptLabels[data.$type].title) {
    return ConceptLabels[data.$type].title;
  }
}

export function getUserAnswersTitle($type: string): string {
  if (!$type) return '';

  if ($type === ObiTypes.ChoiceInput) {
    return 'ChoiceInput';
  }

  if ($type.includes('Input')) {
    return `User Answers (${$type.replace(/Microsoft.(.*)Input/, '$1')})`;
  }

  return '';
}
