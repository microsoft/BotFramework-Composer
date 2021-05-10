// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { useState, useMemo, useCallback, Fragment } from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';

import { separator } from '../../publish/styles';
import { PublishType } from '../../../recoilModel/types';

type ProfileFormDialogProps = {
  onDismiss: () => void;
  targets: PublishTarget[];
  types: PublishType[];
  onNext: () => void;
  setType: (value) => void;
  name: string;
  targetType: string;
  setName: (value: string) => void;
  setTargetType: (value: string) => void;
  current?: { index: number; item: PublishTarget } | null;
};
const labelContainer = css`
  display: flex;
  flex-direction: row;
  margin-bottom: 5px;
`;

const customerLabel = css`
  margin-right: 5px;
  font-weight: 600;
  font-size: 14px;
`;

const onRenderLabel = (props) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props.label} </div>
    </div>
  );
};

const hiddenProfileTypes = ['pva-publish-composer'];

export const ProfileFormDialog: React.FC<ProfileFormDialogProps> = (props) => {
  const { name, setName, targetType, setTargetType, onDismiss, targets, types, onNext, setType, current } = props;
  const [errorMessage, setErrorMsg] = useState('');

  const isValidateProfileName = (newName) => {
    if (!newName || newName.trim() === '') {
      setErrorMsg(formatMessage('Must have a name'));
    } else {
      const exists = !!targets?.some((t) => t.name.toLowerCase() === newName?.toLowerCase());

      if (exists) {
        setErrorMsg(formatMessage('A profile with that name already exists.'));
      } else {
        setErrorMsg('');
      }
    }
  };

  const updateName = (e, newName) => {
    setName(newName);
    isValidateProfileName(newName);
  };

  const targetTypes = useMemo(() => {
    return (
      types
        // some profiles should not be able to be explicitly created
        .filter((t) => {
          const shouldBeHidden = hiddenProfileTypes.some((hiddenType) => hiddenType === t.name);
          return !shouldBeHidden;
        })
        .map((t) => ({ key: t.name, text: t.description }))
    );
  }, [types]);

  const updateType = useCallback(
    (_e, option?: IDropdownOption) => {
      const type = types.find((t) => t.name === option?.key);
      setType(type);
      if (type) {
        setTargetType(type.name);
      }
    },
    [types]
  );

  const saveDisabled = useMemo(() => {
    return !targetType || !name || !!errorMessage;
  }, [errorMessage, name, targetType]);

  return (
    <Fragment>
      <Fragment>
        <div style={{ width: '49%', minHeight: '430px' }}>
          <form>
            <TextField
              required
              ariaLabel={formatMessage('The name of your publishing file')}
              defaultValue={name}
              disabled={current?.item.name ? true : false}
              errorMessage={errorMessage}
              label={formatMessage('Name')}
              placeholder={formatMessage('e.g. AzureBot')}
              styles={{ root: { paddingBottom: '8px' } }}
              onChange={updateName}
              onRenderLabel={onRenderLabel}
            />
            <Dropdown
              required
              ariaLabel={formatMessage('The target where you publish your bot')}
              defaultSelectedKey={targetType}
              label={formatMessage('Publishing target')}
              options={targetTypes}
              placeholder={formatMessage('Select one')}
              onChange={updateType}
              onRenderLabel={onRenderLabel}
            />
          </form>
        </div>
        <Separator css={separator} />
        <DialogFooter>
          <PrimaryButton
            disabled={saveDisabled}
            style={{ margin: '0 4px' }}
            text={formatMessage('Next')}
            onClick={() => {
              onNext();
            }}
          />
          <DefaultButton style={{ margin: '0 4px' }} text={formatMessage('Cancel')} onClick={onDismiss} />
        </DialogFooter>
      </Fragment>
    </Fragment>
  );
};
