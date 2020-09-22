// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, Fragment, useMemo } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { JsonEditor } from '@bfc/code-editor';
import { PublishTarget } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { PublishType } from '../../recoilModel/types';
import { DialogWrapper, DialogTypes } from '../../components/DialogWrapper';
import { dispatcherState, userSettingsState, settingsState } from '../../recoilModel';

import { CreateNewResource } from './createNewResources';
import { SelectExistedResources } from './selectExistedResources';

// import { getAccessTokenInCache } from '../../utils/auth';
interface ProvisionDialogProps {
  onDismiss: () => void;
  // onSubmit: (value: any) => void;
  createNew: (value: any) => void;
  selectedExist: (value: any) => void;
  types: PublishType[];
  targets: PublishTarget[];
  current: PublishTarget | null;
}

export const ProvisionDialog: React.FC<ProvisionDialogProps> = (props) => {
  const userSettings = useRecoilValue(userSettingsState);
  const settings = useRecoilValue(settingsState);

  const [name, setName] = useState(props.current?.name || '');
  const [targetType, setTargetType] = useState<string | undefined>(props.current?.type);
  const [errorMessage, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [editInJson, setEditInJson] = useState(false);
  const [config, setConfig] = useState(props.current ? JSON.parse(props.current.configuration) : undefined);

  const targetTypes = useMemo(() => {
    return props.types.map((t) => ({ key: t.name, text: t.description }));
  }, [props.targets]);

  const updateName = useMemo(
    () => (e, newName) => {
      setErrorMsg('');
      setName(newName);
      isNameValid(newName);
    },
    []
  );
  const isNameValid = useMemo(
    () => (newName) => {
      if (!newName || newName.trim() === '') {
        setErrorMsg(formatMessage('Must have a name'));
      } else {
        const exists = !!props.targets?.find((t) => t.name.toLowerCase() === newName?.toLowerCase);

        if (exists) {
          setErrorMsg(formatMessage('A profile with that name already exists.'));
        }
      }
    },
    [props.targets]
  );

  const updateType = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const type = props.types.find((t) => t.name === option?.key);

      if (type) {
        setTargetType(type.name);
      }
    },
    [props.types]
  );

  const isDisable = useMemo(
    () => () => {
      if (!targetType || !name || errorMessage) {
        return true;
      } else {
        return false;
      }
    },
    [targetType, name, errorMessage]
  );

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
  };

  const steps = [
    {
      children: (
        <Fragment>
          <form>
            <TextField
              defaultValue={props.current ? props.current.name : ''}
              errorMessage={errorMessage}
              label={formatMessage('Create profile name')}
              placeholder={formatMessage('My Staging Environment')}
              onChange={updateName}
            />
            <Dropdown
              defaultSelectedKey={props.current ? props.current.type : null}
              label={formatMessage('Select your publish target')}
              options={targetTypes}
              placeholder={formatMessage('Choose One')}
              onChange={updateType}
            />
            {editInJson && (
              <JsonEditor
                key={targetType}
                editorSettings={userSettings.codeEditor}
                height={200}
                value={config}
                onChange={updateConfig}
              />
            )}
          </form>
          <DialogFooter>
            {!editInJson ? (
              <Fragment>
                <DefaultButton text="Import existing" onClick={() => setEditInJson(true)} />
                <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
                <PrimaryButton
                  disabled={isDisable()}
                  text={formatMessage('Next')}
                  onClick={async () => {
                    setCurrentStep(1);
                  }}
                />
              </Fragment>
            ) : (
              <Fragment>
                <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
                <PrimaryButton
                  disabled={isDisable()}
                  text={formatMessage('Submit')}
                  onClick={() => {
                    const newTargets = settings.publishTargets
                      ? settings.publishTargets.map((item) => {
                          if (item.name === props.current?.name) {
                            return {
                              ...item,
                              configuration: JSON.stringify(config, null, 2),
                            };
                          } else {
                            return item;
                          }
                        })
                      : [];
                    setPublishTargets(newTargets);
                    props.onDismiss();
                  }}
                />
              </Fragment>
            )}
          </DialogFooter>
        </Fragment>
      ),
    },
    {
      children: (
        <CreateNewResource
          onDismiss={props.onDismiss}
          onSubmit={(value) => {
            props.onDismiss();
            props.createNew({ ...value, name: name, type: targetType });
          }}
        />
      ),
    },
  ];
  return (
    <DialogWrapper
      isBlocking
      isOpen
      dialogType={DialogTypes.CreateFlow}
      subText=""
      title={props.current ? formatMessage('Edit a publish profile') : formatMessage('Add a publish profile')}
      onDismiss={props.onDismiss}
    >
      {steps[currentStep].children}
    </DialogWrapper>
  );
};
