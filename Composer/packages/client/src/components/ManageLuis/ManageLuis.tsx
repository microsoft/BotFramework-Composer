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
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import get from 'lodash/get';

import { LUIS_REGIONS } from '../../constants';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

type ManageLuisProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: any) => void;
};

export const ManageLuis = (props: ManageLuisProps) => {
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);

  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey.root;
  const groupLUISEndpointKey = get(sensitiveGroupManageProperty, 'luis.endpointKey', {});
  const rootLuisEndpointKey = groupLUISEndpointKey.root;
  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion.root;

  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>(rootLuisKey ?? '');
  const [localRootLuisEndpointKey, setLocalRootLuisEndpointKey] = useState<string>(rootLuisEndpointKey ?? '');
  const [localRootLuisRegion, setLocalRootLuisRegion] = useState<string>(rootLuisRegion ?? '');

  useEffect(() => {
    setLocalRootLuisKey(rootLuisKey);
    setLocalRootLuisEndpointKey(rootLuisEndpointKey);
    setLocalRootLuisRegion(rootLuisRegion);
  }, [rootLuisKey, rootLuisEndpointKey, rootLuisRegion]);

  const closeDialog = () => {
    props.onDismiss();
    props.onGetKey({
      authoringKey: localRootLuisKey,
      endpointKey: localRootLuisEndpointKey,
      authoringRegion: localRootLuisRegion,
    });
  };

  const handleRootLUISKeyOnChange = (e, value) => {
    if (value) {
      setLocalRootLuisKey(value);
    } else {
      setLocalRootLuisKey('');
    }
  };

  const handleRootLUISEndpointKeyOnChange = (e, value) => {
    setLocalRootLuisEndpointKey(value);
  };

  const handleRootLuisRegionOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setLocalRootLuisRegion(value.key as string);
    } else {
      setLocalRootLuisRegion('');
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
          aria-label={formatMessage('LUIS authoring key')}
          data-testid={'rootLUISAuthoringKey'}
          id={'luisAuthoringKey'}
          label={formatMessage('LUIS authoring key')}
          placeholder={formatMessage('Enter LUIS authoring key')}
          styles={{ root: { marginTop: 10 } }}
          value={localRootLuisKey}
          onChange={handleRootLUISKeyOnChange}
        />
        <TextField
          required
          aria-label={formatMessage('LUIS endpoint key')}
          data-testid={'rootLUISEndpointKey'}
          id={'luisEndpointKey'}
          label={formatMessage('LUIS endpoint key')}
          placeholder={formatMessage('Enter LUIS endpoint key')}
          styles={{ root: { marginTop: 10 } }}
          value={localRootLuisEndpointKey}
          onChange={handleRootLUISEndpointKeyOnChange}
        />
        <Dropdown
          required
          aria-label={formatMessage('LUIS region')}
          data-testid={'rootLUISRegion'}
          id={'luisRegion'}
          label={formatMessage('LUIS region')}
          options={LUIS_REGIONS}
          placeholder={formatMessage('Enter LUIS region')}
          selectedKey={localRootLuisRegion}
          styles={{ root: { marginTop: 10 } }}
          onChange={handleRootLuisRegionOnChange}
        />
      </div>
      <DialogFooter>
        <PrimaryButton
          disabled={!localRootLuisRegion || !localRootLuisKey || !localRootLuisEndpointKey}
          text={formatMessage('Ok')}
          onClick={closeDialog}
        />
      </DialogFooter>
    </Dialog>
  );
};
