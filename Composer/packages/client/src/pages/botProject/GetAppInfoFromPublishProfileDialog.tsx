// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useState, useEffect } from 'react';
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

export const GetAppInfoFromPublishProfileDialog: React.FC<Props> = (props) => {
  const { projectId, hidden, onOK: onAdd, onCancel } = props;
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const [publishTargetOptions, setPublishTargetOptions] = useState<IDropdownOption[]>([]);
  const [publishTargetsErrorMessage, setPublishTargetsErrorMessage] = useState<string | undefined>();
  const [selectedKey, setSelectedKey] = useState<string | number | undefined>();

  const dialogTitle = {
    title: formatMessage('Add from publishing profile'),
    subText: formatMessage('Select the publishing profile you’d like to add a Microsoft App ID and Password from.'),
  };

  const getAppInfo = (profile: PublishTarget) => {
    if (profile) {
      const config = JSON.parse(profile.configuration);
      const appId = config?.settings?.MicrosoftAppId;
      const appPassword = config?.settings?.MicrosoftAppPassword;

      if (appId) {
        return { appId, appPassword };
      }
    }
  };

  useEffect(() => {
    // reset the ui back to no selection
    setPublishTargetOptions([]);

    // generate options
    const options: IDropdownOption[] =
      publishTargets
        ?.map((p) => {
          return { key: p.name, text: p.name, data: getAppInfo(p) };
        })
        .filter((p) => p.data !== undefined) || [];

    setPublishTargetOptions(options);
  }, [publishTargets, projectId]);

  useEffect(() => {
    if (publishTargetOptions.length === 0) {
      setPublishTargetsErrorMessage('No profiles were found containing a Microsoft App ID.');
    } else {
      setPublishTargetsErrorMessage(undefined);
    }
  }, [publishTargetOptions]);

  const handleAdd = () => {
    const opt = publishTargetOptions?.find((p) => p.key === selectedKey);
    if (opt) {
      onAdd(opt.data);
    }
  };

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{
          title: dialogTitle.title,
          subText: dialogTitle.subText,
        }}
        hidden={hidden}
        minWidth={500}
        modalProps={{
          isBlocking: true,
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
            text={formatMessage('Add App ID and Password')}
            onClick={handleAdd}
          />
          <DefaultButton text={formatMessage('Cancel')} onClick={onCancel} />
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
};

//onChange={onSelectProfile}
//onRenderOption={renderDropdownOption}
