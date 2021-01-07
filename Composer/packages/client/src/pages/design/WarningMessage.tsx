// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Button } from 'office-ui-fabric-react/lib/Button';

import { triggerNotSupportedWarning } from '../../constants';
import { colors } from '../../colors';

const warningIcon = {
  marginLeft: 5,
  color: colors.amber,
  fontSize: 20,
  cursor: 'pointer',
};

const warningRoot = {
  display: 'flex',
  background: colors.warningBg,
  height: 50,
  alignItems: 'center',
};

const warningFont = {
  color: colors.gray(40),
  fontSize: 9,
  paddingLeft: 10,
};

const changeRecognizerButton = {
  root: {
    marginLeft: 200,
    border: '1px solid',
    borderRadius: 2,
    fontSize: 14,
  },
};

interface WarningMessageProps {
  okText: string;
  onOk: () => void;
  onCancel: () => void;
}

export const WarningMessage: React.FC<WarningMessageProps> = (props) => {
  const { okText, onOk, onCancel } = props;
  return (
    <div css={warningRoot}>
      <Icon iconName={'Warning'} style={warningIcon} />
      <div css={warningFont}>{triggerNotSupportedWarning}</div>
      <Button
        styles={changeRecognizerButton}
        text={okText}
        onClick={() => {
          onOk();
        }}
      />
      <Icon iconName={'Cancel'} style={warningIcon} onClick={onCancel} />
    </div>
  );
};

export default WarningMessage;
