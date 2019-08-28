/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent } from 'react';

import { InitNodeSize } from '../../../constants/ElementSizes';
import { Icon } from '../../decorations/icon';

const boxWidth = InitNodeSize.width;
const boxHeight = InitNodeSize.height;
const headerHeight = 40;
const contentHeight = boxHeight - headerHeight;

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

interface NodeProps {
  header: string;
  corner?: any;
  label: any;
  icon?: string;
  styles?: object;
  nodeColors: { [key: string]: any };
  onClick: () => void;
  children?: any;
}
export const FormCard: FunctionComponent<NodeProps> = ({
  header,
  corner,
  label,
  icon = 'MessageBot',
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
          fontSize: '14px',
          lineHeight: '19px',
          color: 'black',
          position: 'relative',
        }}
      >
        <div css={{ padding: '10px 10px', fontSize: '14px', fontFamily: 'Segoe UI', lineHeight: '19px' }}>{header}</div>
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
            paddingLeft: '10px',
            margin: '5px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon !== 'none' && (
            <div css={{ width: 30, height: 30, display: 'flex', alignItems: 'center' }}>
              <Icon icon={icon} color={iconColor} size={30} />
            </div>
          )}
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
            {label}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
