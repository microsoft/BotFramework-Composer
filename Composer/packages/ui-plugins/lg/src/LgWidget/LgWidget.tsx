// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import get from 'lodash/get';
import { WidgetContainerProps } from '@bfc/extension';

import { useLgTemplate } from './useLgTemplate';

export interface LgWidgetProps extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPropmt'...) */
  field: string;
  defaultContent?: string;
}

export const LgWidget: React.FC<LgWidgetProps> = ({ data, field, defaultContent }) => {
  const activityTemplate = get(data, field, '');

  const templateText = useLgTemplate(activityTemplate);
  const displayedText = templateText || defaultContent;
  return <>{displayedText}</>;
};
