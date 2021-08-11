// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';
import get from 'lodash/get';

import { FlowLgEditor } from './FlowLgEditor';

export interface LgWidgetProps extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPrompt'...) */
  field: string;
  defaultContent?: string;
}

export const LgWidget: React.FC<LgWidgetProps> = ({ data, field, defaultContent = '' }) => {
  const activityTemplate = get(data, field, '') as string;

  const handleClick = (e: React.MouseEvent) => {
    console.log('in click handler');
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div onClick={handleClick}>
      <FlowLgEditor
        $kind={get(data, '$kind')}
        activityTemplate={activityTemplate || defaultContent}
        designerId={get(data, '$designer.id')}
      />
    </div>
  );
};
