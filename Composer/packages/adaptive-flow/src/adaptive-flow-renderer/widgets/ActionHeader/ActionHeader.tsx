// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { useContext } from 'react';
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';
import { WidgetComponent, WidgetContainerProps } from '@bfc/extension-client';

import { DefaultColors } from '../../constants/ElementColors';
import { RendererContext } from '../../contexts/RendererContext';
import { DisabledIconColor } from '../styles/DisabledStyle';

import { Icon, BuiltinIcons } from './icon';
import {
  HeaderContainerCSS,
  HeaderBodyCSS,
  HeaderTextCSS,
  DisabledHeaderContainerCSS,
  DisabledHeaderTextCSS,
} from './ActionHeaderStyle';

export interface ActionHeaderProps extends WidgetContainerProps {
  title?: string;
  disableSDKTitle?: boolean;
  icon?: string;
  menu?: JSX.Element | 'none';
  colors?: {
    theme: string;
    icon: string;
    color: string;
  };
}

export const ActionHeader: WidgetComponent<ActionHeaderProps> = ({
  id,
  data,
  onEvent,
  title = '',
  disableSDKTitle,
  icon,
  menu,
  colors = DefaultColors,
}) => {
  const disabled = data.disabled === true;
  const containerCSS = disabled ? DisabledHeaderContainerCSS : HeaderContainerCSS(colors.theme);
  const bodyCSS = HeaderBodyCSS;
  const textCSS = disabled ? DisabledHeaderTextCSS : HeaderTextCSS(colors.color);
  const iconColor = disabled ? DisabledIconColor : colors.icon;

  const headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);

  const { NodeMenu } = useContext(RendererContext);
  const menuNode =
    menu === 'none' ? null : menu || <NodeMenu colors={colors} nodeData={data} nodeId={id} onEvent={onEvent} />;

  return (
    <div css={containerCSS}>
      <div css={bodyCSS}>
        {icon && icon !== BuiltinIcons.None && (
          <div
            aria-hidden
            css={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '5px',
            }}
          >
            <Icon color={iconColor} icon={icon} size={16} />
          </div>
        )}
        <div aria-label={headerContent} css={textCSS}>
          {headerContent}
        </div>
      </div>
      <div>{menuNode}</div>
    </div>
  );
};
