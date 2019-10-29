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
import { Icon as FabricIcon } from 'office-ui-fabric-react';

import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { Icon } from '../../decorations/icon';

const boxWidth = 240;
const boxHeight = 125;

const headerHeight = 40;
const contentHeight = boxHeight - headerHeight;

export const IconCard = ({
  corner,
  label,
  trigger,
  summary,
  childDialog,
  icon,
  themeColor,
  iconColor,
  onClick,
  onChildDialogClick,
}) => {
  const containerStyle = {
    width: boxWidth,
    height: boxHeight,
    fontSize: '20px',
    cursor: 'pointer',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: '2px',
    boxShadow: '0px 1.2px 3.6px rgba(0, 0, 0, 0.108), 0px 6.4px 14.4px rgba(0, 0, 0, 0.132)',
  };

  return (
    <div
      className="card"
      data-testid="IconCard"
      css={containerStyle}
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
          fontSize: '14px',
          lineHeight: '19px',
          color: 'black',
          position: 'relative',
        }}
      >
        <div css={{ padding: '10px 10px', fontSize: '14px', fontFamily: 'Segoe UI', lineHeight: '19px' }}>{label}</div>
        <div css={{ position: 'absolute', top: 10, right: 0 }}>{corner}</div>
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
            padding: '5px 10px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          }}
        >
          <div css={{ width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <Icon icon={icon} color={iconColor} size={20} />
          </div>
          <div
            css={{
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '14px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            }}
            title={typeof label === 'string' ? label : ''}
          >
            {trigger}
          </div>
        </div>
        <div
          css={{
            fontWeight: 400,
            padding: '5px 10px 3px',
            borderTop: '1px solid #EBEBEB',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          }}
        >
          <div css={{ width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <Icon icon={ElementIcon.MessageBot} color="#656565" size={20} />
          </div>
          <div
            css={{
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '14px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            }}
            title={typeof label === 'string' ? label : ''}
          >
            {summary && <div>{summary}</div>}
          </div>
        </div>
        <div
          style={{
            height: '100%',
            width: 'calc(100% - 20px)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: '14px',
            lineHeight: '19px',
            fontFamily: 'Segoe UI',
            padding: '0px 10px',
            paddingLeft: '40px',
          }}
          title={typeof label === 'string' ? label : ''}
        >
          {childDialog && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FabricIcon
                style={{ lineHeight: '12px', fontSize: '12px', color: 'blue', paddingRight: '5px' }}
                iconName="OpenSource"
                data-testid="OpenIcon"
                onClick={e => {
                  e.stopPropagation();
                  onChildDialogClick();
                }}
              />
              <span
                style={{
                  cursor: 'pointer',
                  color: 'blue',
                }}
                onClick={e => {
                  e.stopPropagation();
                  onChildDialogClick();
                }}
              >
                {childDialog}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

IconCard.defaultProps = {
  onClick: () => {},
};
