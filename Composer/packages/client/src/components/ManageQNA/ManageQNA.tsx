// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import get from 'lodash/get';

import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

type ManageQNAProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: any) => void;
};

export const ManageQNA = (props: ManageQNAProps) => {
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);

  const groupQnAKey = get(sensitiveGroupManageProperty, 'qna.subscriptionKey', {});
  const rootqnaKey = groupQnAKey.root;
  const [localRootQnAKey, setLocalRootQnAKey] = useState<string>(rootqnaKey ?? '');

  useEffect(() => {
    setLocalRootQnAKey(rootqnaKey);
  }, [rootqnaKey]);

  const closeDialog = () => {
    props.onDismiss();
    props.onGetKey({
      subscriptionKey: localRootQnAKey,
    });
  };

  const handleRootQnAKeyOnChange = (e, value) => {
    if (value) {
      setLocalRootQnAKey(value);
    } else {
      setLocalRootQnAKey('');
    }
  };

  const title = formatMessage('Manage LUIS Key');
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title,
      }}
      hidden={props.hidden}
      modalProps={{
        isBlocking: false,
      }}
      onDismiss={props.onDismiss}
    >
      <div>
        <TextField
          required
          aria-label={formatMessage('QnA Maker Subscription key')}
          data-testid={'QnASubscriptionKey'}
          id={'qnaKey'}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={formatMessage('Enter QnA Maker Subscription key')}
          styles={{ root: { marginTop: 10 } }}
          value={localRootQnAKey}
          onChange={handleRootQnAKeyOnChange}
        />
      </div>
      <DialogFooter>
        <PrimaryButton disabled={!localRootQnAKey} text={formatMessage('Ok')} onClick={closeDialog} />
      </DialogFooter>
    </Dialog>
  );
};
