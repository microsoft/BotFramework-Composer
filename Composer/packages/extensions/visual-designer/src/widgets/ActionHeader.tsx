// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';

import { WidgetComponent, WidgetContainerProps } from '../schema/uischema.types';
import { StandardNodeWidth, HeaderHeight } from '../constants/ElementSizes';
import { ObiColors } from '../constants/ElementColors';
import { NodeMenu } from '../components/menus/NodeMenu';

export interface ActionHeaderProps extends WidgetContainerProps {
  title: string;
  disableSDKTitle?: boolean;
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
`;

const header = css`
  font-size: 12px;
  font-family: Segoe UI;
  line-height: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  whitespace: pre;
`;

export const ActionHeader: WidgetComponent<ActionHeaderProps> = ({
  id,
  data,
  onEvent,
  title,
  disableSDKTitle,
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
          ${header};
          width: calc(100% - 40px);
          padding: 4px 8px;
        `}
      >
        {headerContent}
      </div>
      <div css={{ position: 'absolute', top: 4, right: 0 }}>
        {menu === 'none' ? null : menu || <NodeMenu id={id} onEvent={onEvent} />}
      </div>
    </div>
  );
};
