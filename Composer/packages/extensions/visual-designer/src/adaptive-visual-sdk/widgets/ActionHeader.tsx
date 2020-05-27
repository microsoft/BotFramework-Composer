// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { useContext } from 'react';
import { jsx, css } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';
import { WidgetComponent, WidgetContainerProps } from '@bfc/extension';
import { TruncatedCSS, ColorlessFontCSS } from '@bfc/ui-shared';

import { StandardNodeWidth, HeaderHeight } from '../constants/ElementSizes';
import { DefaultColors } from '../constants/ElementColors';
import { ElementIcon } from '../../utils/obiPropertyResolver';
import { Icon } from '../../components/decorations/icon';
import { FlowRendererContext } from '../../store/FlowRendererContext';

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

const container = css`
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
`;

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
  const headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);

  const headerText = css`
    ${ColorlessFontCSS};
    ${TruncatedCSS};
  `;

  const { NodeMenu } = useContext(FlowRendererContext);
  const menuNode =
    menu === 'none' ? null : menu || <NodeMenu colors={colors} nodeData={data} nodeId={id} onEvent={onEvent} />;

  return (
    <div
      css={css`
        ${container};
        width: ${StandardNodeWidth}px;
        height: ${HeaderHeight}px;
        background-color: ${colors.theme};
      `}
    >
      <div
        css={css`
          width: calc(100% - 40px);
          padding: 4px 8px;
          display: flex;
        `}
      >
        {icon && icon !== ElementIcon.None && (
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
        <div
          aria-label={headerContent}
          css={css`
            ${headerText};
            line-height: 16px;
            transform: translateY(-1px);
            color: ${colors.color || 'black'};
          `}
        >
          {headerContent}
        </div>
      </div>
      <div>{menuNode}</div>
    </div>
  );
};
