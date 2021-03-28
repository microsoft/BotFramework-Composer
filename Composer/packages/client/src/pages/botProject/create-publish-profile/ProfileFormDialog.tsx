// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { useState, useMemo, useCallback, Fragment } from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

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

const iconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

const onRenderLabel = (props) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props.label} </div>
      <TooltipHost content={props.ariaLabel}>
        <Icon iconName="Info" styles={iconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

export const ProfileFormDialog: React.FC<ProfileFormDialogProps> = (props) => {
  const { name, setName, targetType, setTargetType, onDismiss, targets, types, onNext, setType, current } = props;
  const [errorMessage, setErrorMsg] = useState('');

  const updateName = (e, newName) => {
    setName(newName);
    isValidateProfileName(newName);
  };

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

  const targetTypes = useMemo(() => {
    return types.map((t) => ({ key: t.name, text: t.description }));
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
              placeholder={formatMessage('Select One')}
              onChange={updateType}
              onRenderLabel={onRenderLabel}
            />
          </form>
        </div>
        <Separator css={separator} />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            disabled={saveDisabled}
            text={formatMessage('Next: Configure resources')}
            onClick={() => {
              onNext();
            }}
          />
        </DialogFooter>
      </Fragment>
    </Fragment>
  );
};
