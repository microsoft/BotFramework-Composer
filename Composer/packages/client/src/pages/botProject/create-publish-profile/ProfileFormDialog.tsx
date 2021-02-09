// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { SharedColors } from '@uifabric/fluent-theme';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { useState, useMemo, useCallback, Fragment, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { separator } from '../../publish/styles';
import { armScopes, graphScopes } from '../../../constants';
import { PublishType } from '../../../recoilModel/types';
import { isShowAuthDialog } from '../../../utils/auth';
import { AuthDialog } from '../../../components/Auth/AuthDialog';
import { PluginAPI } from '../../../plugins/api';
import { dispatcherState } from '../../../recoilModel';
import { AuthClient } from '../../../utils/authClient';
import { getTokenFromCache, isGetTokenFromUser } from '../../../utils/auth';

type ProfileFormDialogProps = {
  onDismiss: () => void;
  targets: PublishTarget[];
  types: PublishType[];
  onNext: () => void;
  updateSettings: (name: string, type: string, configuration: string) => Promise<void>;
  projectId: string;
  setType: (value) => void;
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
  const { onDismiss, targets, types, onNext, updateSettings, projectId, setType, current } = props;
  const [name, setName] = useState(current?.item.name || '');
  const [errorMessage, setErrorMsg] = useState('');
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { provisionToTarget } = useRecoilValue(dispatcherState);

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

  // pass functions to extensions
  useEffect(() => {
    PluginAPI.publish.getType = () => {
      return targetType;
    };
    PluginAPI.publish.getSchema = () => {
      return types.find((t) => t.name === targetType)?.schema;
    };
    PluginAPI.publish.savePublishConfig = (config) => {
      updateSettings(name, targetType, JSON.stringify(config) || '{}');
    };
  }, [targetType, name, types, updateSettings]);

  useEffect(() => {
    PluginAPI.publish.startProvision = async (config) => {
      const fullConfig = { ...config, name: name, type: targetType };
      let arm, graph;
      if (!isGetTokenFromUser()) {
        // login or get token implicit
        arm = await AuthClient.getAccessToken(armScopes);
        graph = await AuthClient.getAccessToken(graphScopes);
      } else {
        // get token from cache
        arm = getTokenFromCache('accessToken');
        graph = getTokenFromCache('graphToken');
      }
      provisionToTarget(fullConfig, config.type, projectId, arm, graph, current?.item);
    };
  }, [name, targetType]);

  return (
    <Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph
          next={() => {
            onNext();
          }}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
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
            onClick={async () => {
              if (isShowAuthDialog(true)) {
                setShowAuthDialog(true);
              } else {
                onNext();
              }
            }}
          />
        </DialogFooter>
      </Fragment>
    </Fragment>
  );
};
