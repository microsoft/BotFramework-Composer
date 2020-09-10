// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

// -------------------- Styles -------------------- //

const container = css`
  cursor: pointer;
  position: absolute;
  display: flex;
  right: 0px;
  width: 48px;
  height: 100%;
  align-items: center;
  justify-content: space-around;
`;

const ringer = css`
  color: white;
`;

const circleMask = css`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #005a9e;
`;

const numberContainer = css`
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  position: absolute;
  right: 8px;
  top: 8px;
`;

const numberText = css`
  transform: scale(0.5);
  font-size: 20px;
  color: white;
`;

// -------------------- NotificationIcon -------------------- //

interface INotificationIconProps {
  number: number;
}

export const NotificationIcon = (props: INotificationIconProps) => {
  const { number } = props;
  return (
    <div css={container} role="presentation">
      <Icon css={ringer} iconName="Ringer" />
      {number > 0 && <Icon css={circleMask} iconName="FullCircleMask" />}
      {number > 0 && (
        <div css={numberContainer}>
          <span css={numberText}>{number > 99 ? '...' : number}</span>
        </div>
      )}
    </div>
  );
};
