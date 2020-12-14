// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { useState, useMemo, useCallback, Fragment, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PublishTarget } from '@bfc/shared';

import { separator } from '../../publish/styles';
import { armScopes, graphScopes } from '../../../constants';
import { PublishType } from '../../../recoilModel/types';
import { isShowAuthDialog } from '../../../utils/auth';
import { AuthDialog } from '../../../components/Auth/AuthDialog';
import { PluginAPI } from '../../../plugins/api';
import { dispatcherState } from '../../../recoilModel';
import { AuthClient } from '../../../utils/authClient';
import { getTokenFromCache, isGetTokenFromUser } from '../../../utils/auth';

type AddProfileDialogProps = {
  onDismiss: () => void;
  targets: PublishTarget[];
  types: PublishType[];
  onNext: () => void;
  updateSettings: (name: string, type: string, configuration: string) => Promise<void>;
  projectId: string;
  setType: (value) => void;
};

export const AddProfileDialog: React.FC<AddProfileDialogProps> = (props) => {
  const { onDismiss, targets, types, onNext, updateSettings, projectId, setType } = props;
  const [name, setName] = useState('');
  const [errorMessage, setErrorMsg] = useState('');
  const [targetType, setTargetType] = useState<string>('');
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
      provisionToTarget(fullConfig, config.type, projectId, arm, graph);
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
        <div style={{ width: '60%', minHeight: '300px' }}>
          <form>
            <TextField
              defaultValue={name}
              errorMessage={errorMessage}
              label={formatMessage('Create profile name')}
              placeholder={formatMessage('My Staging Environment')}
              onChange={updateName}
            />
            <Dropdown
              defaultSelectedKey={targetType}
              label={formatMessage('Select your publish target')}
              options={targetTypes}
              placeholder={formatMessage('Choose One')}
              onChange={updateType}
            />
          </form>
        </div>
        <Separator css={separator} />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            disabled={saveDisabled}
            text={formatMessage('Next')}
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
