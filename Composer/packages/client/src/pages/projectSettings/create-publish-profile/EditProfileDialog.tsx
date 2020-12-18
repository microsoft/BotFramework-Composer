// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { useState, useCallback, useMemo } from 'react';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';
import { JsonEditor } from '@bfc/code-editor';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { PublishType } from '../../../recoilModel/types';
import { label, separator } from '../../publish/styles';
import { userSettingsState } from '../../../recoilModel';

type EditProfileDialogProps = {
  onDismiss: () => void;
  current: { index: number; item: PublishTarget } | null;
  types: PublishType[];
  updateSettings: (name: string, type: string, configuration: string, editTarget: any) => Promise<void>;
};

export const EditProfileDialog: React.FC<EditProfileDialogProps> = (props) => {
  const { current, onDismiss, types, updateSettings } = props;
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');
  const userSettings = useRecoilValue(userSettingsState);
  const [config, setConfig] = useState(current ? JSON.parse(current.item.configuration) : undefined);

  const targetTypes = useMemo(() => {
    return types.map((t) => ({ key: t.name, text: t.description }));
  }, [types]);

  const updateType = useCallback(
    (_e, option?: IDropdownOption) => {
      const type = targetTypes.find((t) => t.key === option?.key);

      if (type) {
        setTargetType(type.key);
      }
    },
    [targetTypes]
  );

  const selectedType = useMemo(() => {
    return types.find((t) => t.name === targetType);
  }, [types, targetType]);

  const submit = useCallback(
    (_e) => {
      if (targetType) {
        updateSettings(current?.item.name || '', targetType, JSON.stringify(config) || '{}', current);
        onDismiss();
      }
    },
    [targetType, config, current, updateSettings]
  );

  return (
    <DialogWrapper
      isOpen
      dialogType={DialogTypes.Customer}
      minWidth={960}
      title={formatMessage('Edit a publish profile')}
      onDismiss={onDismiss}
    >
      <div style={{ width: '49%' }}>
        <form>
          <TextField
            readOnly
            required
            defaultValue={current?.item.name || ''}
            label={formatMessage('Name')}
            placeholder={formatMessage('My Staging Environment')}
            styles={{ root: { paddingBottom: '11px' } }}
          />
          <Dropdown
            required
            defaultSelectedKey={targetType}
            label={formatMessage('Publish target')}
            options={targetTypes}
            placeholder={formatMessage('Choose One')}
            onChange={updateType}
          />
        </form>
        {selectedType?.instructions && <p style={{}}>{selectedType.instructions}</p>}
        <div css={label}>{formatMessage('Publish Configuration')}</div>
        <JsonEditor
          key={targetType}
          editorSettings={userSettings.codeEditor}
          height={260}
          schema={selectedType?.schema}
          value={config}
          onChange={setConfig}
        />
      </div>
      <Separator css={separator} />
      <DialogFooter
        styles={{
          actions: {
            marginTop: '12px',
          },
        }}
      >
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton disabled={!targetType} text={formatMessage('Save')} onClick={submit} />
      </DialogFooter>
    </DialogWrapper>
  );
};
