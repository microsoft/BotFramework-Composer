// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';

import { WidgetComponent, WidgetContainerProps } from '../schema/uischema.types';
import { StandardNodeWidth, HeaderHeight } from '../constants/ElementSizes';
import { ObiColors } from '../constants/ElementColors';
import { NodeMenu } from '../components/menus/NodeMenu';
import { ElementIcon } from '../utils/obiPropertyResolver';
import { Icon } from '../components/decorations/icon';

export interface ActionHeaderProps extends WidgetContainerProps {
  title: string;
  disableSDKTitle?: boolean;
  icon?: string;
  menu?: JSX.Element | 'none';
  colors: {
    theme: string;
    icon: string;
  };
}

const DefaultColors = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
};

const container = css`
  cursor: pointer;
  font-family: Segoe UI;
  font-size: 12px;
  line-height: 14px;
  color: black;
  position: relative;
`;

const headerText = css`
  font-size: 12px;
  font-family: Segoe UI;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
`;

export const ActionHeader: WidgetComponent<ActionHeaderProps> = ({
  id,
  data,
  onEvent,
  title,
  disableSDKTitle,
  icon,
  menu,
  colors = DefaultColors,
}) => {
  const headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);

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
            css={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '5px',
            }}
          >
            <Icon icon={icon} color={colors.icon} size={16} />
          </div>
        )}
        <div
          css={css`
            ${headerText};
            line-height: 16px;
            transform: translateY(-1px);
          `}
        >
          {headerContent}
        </div>
      </div>
      <div css={{ position: 'absolute', top: 4, right: 0 }}>
        {menu === 'none' ? null : menu || <NodeMenu id={id} onEvent={onEvent} />}
      </div>
    </div>
  );
};
