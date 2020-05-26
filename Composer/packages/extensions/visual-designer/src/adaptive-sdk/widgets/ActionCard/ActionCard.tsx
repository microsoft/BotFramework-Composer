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
}

export const ActionCard: WidgetComponent<ActionCardProps> = ({ header, body, footer, ...widgetContext }) => {
  return <CardTemplate header={header || <ActionHeader {...widgetContext} />} body={body} footer={footer} />;
};
