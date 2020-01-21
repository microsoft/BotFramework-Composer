// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { generateSDKTitle } from '@bfc/shared';

import { FormCard } from '../components/nodes/templates/FormCard';
import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { ObiColors } from '../constants/ElementColors';
import { NodeMenu } from '../components/menus/NodeMenu';

export interface ActionCardProps extends WidgetContainerProps {
  title: string;
  disableSDKTitle?: boolean;
  icon: string;
  content: string | number | JSX.Element;
  menu?: JSX.Element | string;
  colors?: {
    theme: string;
    icon: string;
  };
}

const DefaultCardColor = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
};

export const ActionCard: WidgetComponent<ActionCardProps> = ({
  id,
  data,
  onEvent,
  title,
  disableSDKTitle,
  icon,
  menu,
  content,
  colors = DefaultCardColor,
}) => {
  const header = disableSDKTitle ? title : generateSDKTitle(data, title);
  const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };
  return (
    <FormCard
      header={header}
      corner={menu === 'none' ? null : menu || <NodeMenu id={id} onEvent={onEvent} />}
      icon={icon}
      label={content}
      nodeColors={nodeColors}
    />
  );
};
