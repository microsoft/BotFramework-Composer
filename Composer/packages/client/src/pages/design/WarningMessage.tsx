// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { navigateTo } from '../../utils/navigation';
import { projectIdState } from '../../recoilModel';

const warningIcon = {
  marginLeft: 5,
  color: '#8A8780',
  fontSize: 20,
  cursor: 'pointer',
};

const warningRoot = {
  display: 'flex',
  background: '#FFF4CE',
  height: 50,
  alignItems: 'center',
};

const warningFont = {
  color: SharedColors.gray40,
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
  setShowWarning: (showWarning: boolean) => void;
}

export const warningContent = formatMessage(
  'This trigger type is not supported by the RegEx recognizer. To ensure this trigger is fired, change the recognizer type.'
);

export const WarningMessage: React.FC<WarningMessageProps> = (props) => {
  const { setShowWarning } = props;
  const projectId = useRecoilValue(projectIdState);
  return (
    <div css={warningRoot}>
      <Icon iconName={'Warning'} style={warningIcon} />
      <div css={warningFont}>{warningContent}</div>
      <Button
        styles={changeRecognizerButton}
        text={formatMessage('Change Recognizer')}
        onClick={() => {
          navigateTo(`/bot/${projectId}/qna/all`);
        }}
      />
      <Icon iconName={'Cancel'} style={warningIcon} onClick={() => setShowWarning(false)} />
    </div>
  );
};

export default WarningMessage;
