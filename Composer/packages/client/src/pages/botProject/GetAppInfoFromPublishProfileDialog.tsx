// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useMemo } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import Dialog, { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { settingsState } from '../../recoilModel/atoms/botState';

type AppInfo = {
  appId: string;
  appPassword?: string;
};

type Props = {
  projectId: string;
  hidden?: boolean;
  onOK: (info: AppInfo) => void;
  onCancel: () => void;
};

const getAppInfo = (profile: PublishTarget) => {
  if (profile) {
    try {
      const config = JSON.parse(profile.configuration);
      const appId = config?.settings?.MicrosoftAppId;
      const appPassword = config?.settings?.MicrosoftAppPassword;

      if (appId) {
        return { appId, appPassword };
      }
    } catch (err) {
      console.log(err);
    }
  }
};

export const GetAppInfoFromPublishProfileDialog: React.FC<Props> = (props) => {
  const { projectId, hidden, onOK: onAdd, onCancel } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const [selectedKey, setSelectedKey] = useState<string | number | undefined>();

  const publishTargetOptions = useMemo(() => {
    const options: IDropdownOption[] =
      publishTargets
        ?.map((p) => {
          return { key: p.name, text: p.name, data: getAppInfo(p) };
        })
        .filter((p) => p.data !== undefined) || [];
    return options;
  }, [publishTargets]);

  const publishTargetsErrorMessage = useMemo(() => {
    if (publishTargetOptions.length === 0) {
      return formatMessage('No profiles were found containing a Microsoft App ID.');
    }
    return undefined;
  }, [publishTargetOptions]);

  const dialogTitle = {
    title: formatMessage('Retrieve App ID from publishing profile'),
    subText: formatMessage(
      'A publishing profile contains the information necessary to provision and publish your bot, including its App ID.'
    ),
  };

  const handleAdd = () => {
    const opt = publishTargetOptions?.find((p) => p.key === selectedKey);
    if (opt) {
      onAdd(opt.data);
    }
  };

  return (
    <Dialog
      dialogContentProps={{
        title: dialogTitle.title,
        subText: dialogTitle.subText,
      }}
      hidden={hidden}
      minWidth={500}
      modalProps={{
        isBlocking: true,
        isClickableOutsideFocusTrap: true,
      }}
      onDismiss={onCancel}
    >
      <div css={{ height: '100px' }}>
        <Dropdown
          errorMessage={publishTargetsErrorMessage}
          options={publishTargetOptions}
          placeholder={formatMessage('Select publishing profile')}
          selectedKey={selectedKey}
          styles={{
            root: { marginBottom: 10 },
            dropdown: { width: 450 },
          }}
          onChange={(_, opt) => {
            setSelectedKey(opt?.key);
          }}
        />
      </div>
      <DialogFooter>
        <PrimaryButton
          disabled={!!publishTargetsErrorMessage || !selectedKey}
          text={formatMessage('Save App ID')}
          onClick={handleAdd}
        />
        <DefaultButton text={formatMessage('Cancel')} onClick={onCancel} />
      </DialogFooter>
    </Dialog>
  );
};
