/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent } from 'react';

import { InitNodeSize } from '../../../constants/ElementSizes';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { Icon } from '../../decorations/icon';

const boxWidth = InitNodeSize.width;
const boxHeight = InitNodeSize.height;
const headerHeight = InitNodeSize.height / 2;
const contentHeight = boxHeight - headerHeight;

const containerStyle = {
  width: boxWidth,
  height: boxHeight,
  fontSize: '12px',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: '2px 2px 0 0',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
};

interface NodeProps {
  header: string;
  corner?: any;
  label: any;
  icon?: string;
  iconSize?: number;
  styles?: object;
  nodeColors: { [key: string]: any };
  onClick: () => void;
  children?: any;
}
export const FormCard: FunctionComponent<NodeProps> = ({
  header,
  corner,
  label,
  icon,
  iconSize,
  nodeColors,
  onClick,
  children = null,
  styles = {},
}) => {
  const { themeColor, iconColor } = nodeColors;
  return (
    <div
      className="card"
      data-testid="FormCard"
      css={[containerStyle, { ...styles }]}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div
        className="card__header"
        css={{
          width: '100%',
          height: `${headerHeight}px`,
          backgroundColor: themeColor,
          fontFamily: 'Segoe UI',
          fontSize: '12px',
          lineHeight: '14px',
          color: 'black',
        }}
      >
        <div css={{ padding: '4px 8px', fontSize: '12px', fontFamily: 'Segoe UI', lineHeight: '14px' }}>{header}</div>
        <div css={{ position: 'absolute', top: 4, right: 0 }}>{corner}</div>
      </div>
      <div
        className="card__content"
        css={{
          width: '100%',
          height: contentHeight,
        }}
      >
        <div
          css={{
            fontWeight: 400,
            paddingLeft: '5px',
            margin: '3px 5px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'center',
          }}
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
              <Icon icon={icon} color={iconColor} size={iconSize || 16} />
            </div>
          )}
          <div
            css={{
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '12px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            }}
            title={typeof label === 'string' ? label : ''}
          >
            {label}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
