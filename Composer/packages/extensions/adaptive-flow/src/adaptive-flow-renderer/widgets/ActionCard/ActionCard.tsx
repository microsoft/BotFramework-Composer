// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { ReactNode } from 'react';

import { WidgetContainerProps, WidgetComponent } from '../../types/flowRenderer.types';
import { ActionHeader } from '../ActionHeader';

import { CardTemplate } from './CardTemplate';

export interface ActionCardProps extends WidgetContainerProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}

export const ActionCard: WidgetComponent<ActionCardProps> = ({ header, body, footer, ...widgetContext }) => {
  const disabled = widgetContext.data.disabled === true;
  return (
    <CardTemplate
      body={body}
      disabled={disabled}
      footer={footer}
      header={header || <ActionHeader {...widgetContext} />}
    />
  );
};
