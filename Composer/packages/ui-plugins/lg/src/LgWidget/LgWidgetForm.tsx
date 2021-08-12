// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { WidgetContainerProps, useShellApi } from '@bfc/extension-client';
import get from 'lodash/get';

import { FlowLgEditor } from './FlowLgEditor';

export interface LgWidgetProps extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPrompt'...) */
  field: string;
  defaultContent?: string;
}

export const LgWidget: React.FC<LgWidgetProps> = ({ id, data, field, defaultContent = '' }) => {
  const { shellApi } = useShellApi();
  const activityTemplate = get(data, field, '') as string;

  // need to prevent the flow from stealing focus
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onChange = (templateId) => {
    shellApi.saveData({ ...data, [field]: templateId }, id);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div onClick={handleClick}>
      <FlowLgEditor
        $kind={get(data, '$kind')}
        activityTemplate={activityTemplate || defaultContent}
        designerId={get(data, '$designer.id')}
        name={field}
        onChange={onChange}
      />
    </div>
  );
};
