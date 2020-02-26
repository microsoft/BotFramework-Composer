// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  minHeight: boxHeight,
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
  onClick?: () => void;
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
        if (typeof onClick === 'function') {
          e.stopPropagation();
          onClick();
        }
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
        <div
          css={{
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'Segoe UI',
            lineHeight: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: 'calc(100% - 40px)',
            whiteSpace: 'pre',
          }}
        >
          {header}
        </div>
        <div css={{ position: 'absolute', top: 4, right: 0 }}>{corner}</div>
      </div>
      <div
        className="card__content"
        css={{
          width: '100%',
          minHeight: contentHeight,
          display: 'inline-block',
        }}
      >
        <div
          css={{
            fontWeight: 400,
            paddingLeft: '5px',
            margin: '2px 5px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'inline-flex',
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
              whiteSpace: 'initial',
              fontSize: '12px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
              overflowWrap: 'break-word',
              wordBreak: 'break-all',
              display: 'inline-block',
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
