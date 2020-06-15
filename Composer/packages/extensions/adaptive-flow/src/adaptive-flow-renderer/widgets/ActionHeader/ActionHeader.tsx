// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { useContext } from 'react';
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';

import { WidgetComponent, WidgetContainerProps } from '../../types/flowRenderer.types';
import { DefaultColors } from '../../constants/ElementColors';
import { RendererContext } from '../../contexts/RendererContext';

import { Icon, BuiltinIcons } from './icon';
import { HeaderContainerCSS, HeaderBodyCSS, HeaderTextCSS } from './ActionHeader.style';

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
  const { disabled } = data;
  const headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);

  const { NodeMenu } = useContext(RendererContext);
  const menuNode =
    menu === 'none' ? null : menu || <NodeMenu colors={colors} nodeData={data} nodeId={id} onEvent={onEvent} />;

  return (
    <div css={HeaderContainerCSS(colors.theme)}>
      <div css={HeaderBodyCSS}>
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
            <Icon color={colors.icon} icon={icon} size={16} />
          </div>
        )}
        <div aria-label={headerContent} css={HeaderTextCSS(colors.color)}>
          {headerContent}
        </div>
      </div>
      <div>{menuNode}</div>
    </div>
  );
};
