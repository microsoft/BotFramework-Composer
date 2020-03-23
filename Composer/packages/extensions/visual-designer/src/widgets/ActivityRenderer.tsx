// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import get from 'lodash/get';

import { useLgTemplate } from '../hooks/useLgTemplate';
import { WidgetContainerProps } from '../schema/uischema.types';

export interface ActivityRenderer extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPropmt'...) */
  field: string;
  defaultContent?: string;
}

export const ActivityRenderer: React.FC<ActivityRenderer> = ({ data, field, defaultContent }) => {
  const activityTemplate = get(data, field, '');

  const templateText = useLgTemplate(activityTemplate);
  const displayedText = templateText || defaultContent;
  return <>{displayedText}</>;
};
