// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { ReactNode } from 'react';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';

import { CardTemplate } from '../components/nodes/templates/CardTemplate';

import { ActionHeader } from './ActionHeader';

export interface ActionCardProps extends WidgetContainerProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}

export const ActionCard: WidgetComponent<ActionCardProps> = ({ header, body, footer, ...widgetContext }) => {
  return <CardTemplate body={body} footer={footer} header={header || <ActionHeader {...widgetContext} />} />;
};
