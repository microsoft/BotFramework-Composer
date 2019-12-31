// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import { ConceptLabels } from '@bfc/shared';

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

const truncateSDKType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');

/**
 * Title priority: $designer.name > override title > title from sdk schema > $type suffix
 * @param overrideTitle customized title
 */
export function generateSDKTitle(overrideTitle?: string) {
  const titleFromUischema = overrideTitle;
  return data => {
    const $type = get(data, '$type');
    const titleFrom$designer = get(data, '$designer.name');
    const titleFromShared = get(ConceptLabels, [$type, 'title']);
    const titleFrom$type = truncateSDKType($type);

    return titleFrom$designer || titleFromUischema || titleFromShared || titleFrom$type;
  };
}
