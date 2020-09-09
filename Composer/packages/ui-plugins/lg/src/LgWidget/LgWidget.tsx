// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import get from 'lodash/get';
import { WidgetContainerProps } from '@bfc/editor-extension';
import { MultilineTextWithEllipsis } from '@bfc/ui-shared';

import { useLgTemplate } from './useLgTemplate';
import { normalizeLgText, isActivityString } from './normalizeLgText';

export interface LgWidgetProps extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPropmt'...) */
  field: string;
  defaultContent?: string;
}

export const LgWidget: React.FC<LgWidgetProps> = ({ data, field, defaultContent = '' }) => {
  const activityTemplate = get(data, field, '');

  const templateText = useLgTemplate(activityTemplate);
  const displayedText = templateText ? normalizeLgText(templateText) : defaultContent;

  if (isActivityString(displayedText)) {
    // show ellipsis if it starts with [activity
    return <MultilineTextWithEllipsis>{displayedText}</MultilineTextWithEllipsis>;
  }
  // otherwise show full text
  return <>{displayedText}</>;
};
