// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { ReactNode } from 'react';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';

import { ActionHeader } from '../ActionHeader';

import { CardTemplate } from './CardTemplate';

export interface ActionCardProps extends WidgetContainerProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  hideFooter?: boolean;
}

export const ActionCard: WidgetComponent<ActionCardProps> = ({
  header,
  body,
  footer,
  hideFooter = false,
  ...widgetContext
}) => {
  const disabled = widgetContext.data.disabled === true;
  return (
    <CardTemplate
      body={body}
      disabled={disabled}
      footer={hideFooter ? null : footer}
      header={header || <ActionHeader {...widgetContext} />}
    />
  );
};
