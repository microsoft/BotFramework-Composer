// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import QnAIcon000 from '../images/QnAIcon000.svg';
import QnAIcon999 from '../images/QnAIcon999.svg';
import QnAIcon4f4f4f from '../images/QnAIcon4f4f4f.svg';

interface QnAIconProps {
  active: boolean;
  disabled: boolean;
}

export const QnAIcon: React.FC<QnAIconProps> = (props) => {
  const { active, disabled } = props;

  const QnAIconStyle = (active: boolean, disabled: boolean) =>
    ({
      root: {
        color: active ? '#000' : disabled ? '#999' : '#4f4f4f',
        padding: '8px 12px',
        marginLeft: active ? '1px' : '4px',
        marginRight: '12px',
        boxSizing: 'border-box',
        fontSize: `${FontSizes.size16}`,
        width: '40px',
        height: '32px',
      },
    } as IButtonStyles);

  return (
    <Icon
      imageProps={{
        src: active ? QnAIcon000 : disabled ? QnAIcon999 : QnAIcon4f4f4f,
      }}
      styles={QnAIconStyle(active, disabled)}
    />
  );
};

export default QnAIcon;
