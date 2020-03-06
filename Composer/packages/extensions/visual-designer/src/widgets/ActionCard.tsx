// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { CardTemplate } from '../components/nodes/templates/CardTemplate';

import { ActionHeader } from './ActionHeader';

export interface ActionCardProps extends WidgetContainerProps {
  title: string;
  content: string | number | JSX.Element;
}

export const ActionCard: WidgetComponent<ActionCardProps> = ({ id, data, onEvent, title, content }) => {
  return <CardTemplate header={<ActionHeader id={id} data={data} onEvent={onEvent} title={title} />} body={content} />;
};
