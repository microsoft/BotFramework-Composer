// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';

import { colors } from '../constants';

const color = (active: boolean, disabled: boolean) => {
  return active ? colors.black : disabled ? colors.gray110 : colors.gray140;
};

type BotProjectsSettingsIconProps = {
  active: boolean;
  disabled: boolean;
};

export const BotProjectsSettingsIcon: React.FC<BotProjectsSettingsIconProps> = (props) => {
  const { active, disabled } = props;

  return (
    <svg
      fill={color(active, disabled)}
      style={{
        padding: '8px 12px',
        marginLeft: active ? '1px' : '4px',
        marginRight: '12px',
        boxSizing: 'border-box',
        fontSize: `${FontSizes.size16}`,
        width: '40px',
        height: '32px',
      }}
      viewBox="0 0 16 15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M15.1,1.7l.3.7a.9.9,0,0,1,.3.6,2.506,2.506,0,0,1,.2.7,2.21,2.21,0,0,1,.1.8,5.028,5.028,0,0,1-.2,1.2,4.895,4.895,0,0,1-.4,1.1l-.7.9-.9.7-1.1.4L11.5,9h-.7L4.5,15.2l-.9.6-1,.2-1-.2a1.6,1.6,0,0,1-.8-.6,1.6,1.6,0,0,1-.6-.8,3.6,3.6,0,0,1-.2-1,3,3,0,0,1,.2-1,2.394,2.394,0,0,1,.6-.9L7.1,5.2A.4.4,0,0,1,7,4.9V4.5a5.028,5.028,0,0,1,.2-1.2,4.895,4.895,0,0,1,.4-1.1l.7-.9L9.2.6,10.3.2,11.5,0h.8l.7.2a.9.9,0,0,1,.6.3l.7.3L11.2,4l.8.8ZM11.5,8a3.5,3.5,0,0,0,1.4-.3A4.079,4.079,0,0,0,14,7a4.079,4.079,0,0,0,.7-1.1A3.5,3.5,0,0,0,15,4.5a4.328,4.328,0,0,0-.2-1.1L12,6.2,9.8,4l2.8-2.8L11.5,1a3.5,3.5,0,0,0-1.4.3A4.079,4.079,0,0,0,9,2a4.079,4.079,0,0,0-.7,1.1A3.5,3.5,0,0,0,8,4.5V5c.1.2.1.4.2.5L1.5,12.2l-.4.6a1.3,1.3,0,0,0-.1.6,1.3,1.3,0,0,0,.1.6,1,1,0,0,0,.4.5,1,1,0,0,0,.5.4H3.2l.6-.4,6.7-6.7L11,8Z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default BotProjectsSettingsIcon;
