// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { generateSDKTitle } from '@bfc/shared';
import get from 'lodash/get';

import { ElementIcon } from '../utils/obiPropertyResolver';
import { NodeMenu } from '../components/menus/NodeMenu';
import { FormCard } from '../components/nodes/templates/FormCard';
import { useLgTemplate } from '../utils/hooks';
import { WidgetContainerProps } from '../schema/uischema.types';
import { ObiColors } from '../constants/ElementColors';

export interface ActivityRenderer extends WidgetContainerProps {
  /** indicates which field contains lg activity. ('activity', 'prompt', 'invalidPropmt'...) */
  field: string;
  icon: ElementIcon;
  title?: string;
  disableSDKTitle?: boolean;
  defaultContent?: string;
  colors?: {
    theme: string;
    icon: string;
  };
}

const DefaultThemeColor = {
  theme: ObiColors.BlueMagenta20,
  icon: ObiColors.BlueMagenta30,
};

export const ActivityRenderer: React.FC<ActivityRenderer> = ({
  id,
  data,
  onEvent,
  title,
  disableSDKTitle,
  field,
  defaultContent,
  icon = ElementIcon.MessageBot,
  colors = DefaultThemeColor,
}) => {
  const designerId = get(data, '$designer.id');
  const activityTemplate = get(data, field, '');

  const templateText = useLgTemplate(activityTemplate, designerId);
  const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };

  return (
    <FormCard
      header={disableSDKTitle ? title : generateSDKTitle(data, title)}
      label={templateText || defaultContent}
      icon={icon}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      nodeColors={nodeColors}
    />
  );
};
