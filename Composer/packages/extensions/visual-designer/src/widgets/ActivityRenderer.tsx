// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import get from 'lodash/get';

import { useLgTemplate } from '../utils/hooks';
import { WidgetContainerProps } from '../schema/uischema.types';

export interface ActivityRenderer extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPropmt'...) */
  field: string;
  defaultContent?: string;
}

export const ActivityRenderer: React.FC<ActivityRenderer> = ({ data, field, defaultContent }) => {
  const designerId = get(data, '$designer.id');
  const activityTemplate = get(data, field, '');

  const templateText = useLgTemplate(activityTemplate, designerId);
  const displayedText = templateText || defaultContent;
  return <>{displayedText}</>;
};
