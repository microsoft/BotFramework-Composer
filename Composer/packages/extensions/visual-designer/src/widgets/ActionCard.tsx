// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { generateSDKTitle } from '@bfc/shared';

import { FormCard } from '../components/nodes/templates/FormCard';
import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { ObiColors } from '../constants/ElementColors';

export interface ActionCardProps extends WidgetContainerProps {
  title: string;
  icon?: string;
  content?: string | number | JSX.Element;
  menu: JSX.Element;
  colors?: {
    theme: string;
    icon: string;
  };
  onClick: () => any;
}

const DefaultCardColor = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
};

export const ActionCard: WidgetComponent<ActionCardProps> = ({
  data,
  title,
  icon,
  content,
  menu,
  onClick,
  colors = DefaultCardColor,
}) => {
  const header = generateSDKTitle(data, title);
  const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };
  return (
    <FormCard header={header} corner={menu} icon={icon} label={content} nodeColors={nodeColors} onClick={onClick} />
  );
};
